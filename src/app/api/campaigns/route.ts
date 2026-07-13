import { NextRequest, NextResponse } from "next/server";
import { fbFetch, fbPost, AD_ACCOUNTS } from "@/lib/fb";

// GET /api/campaigns?account=act_xxx&status=ACTIVE
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("account") ?? AD_ACCOUNTS[0].id;
    const status = searchParams.get("status") ?? "";

    const fields = "id,name,status,objective,daily_budget,lifetime_budget,spend_cap,start_time,stop_time,created_time,updated_time";
    const params: Record<string, string> = { fields, limit: "50" };
    if (status) params.effective_status = JSON.stringify([status]);

    const data = await fbFetch(`/${accountId}/campaigns`, params);

    // Get insights for each campaign
    const campaignIds = (data.data ?? []).map((c: { id: string }) => c.id);
    let insights: Record<string, { spend: string; impressions: string; clicks: string; ctr: string; cpc: string }> = {};

    if (campaignIds.length > 0) {
      try {
        const insightRes = await fbFetch(`/${accountId}/insights`, {
          fields: "campaign_id,spend,impressions,clicks,ctr,cpc",
          level: "campaign",
          date_preset: "last_30d",
          limit: "50",
        });
        for (const row of insightRes.data ?? []) {
          insights[row.campaign_id] = row;
        }
      } catch {}
    }

    const campaigns = (data.data ?? []).map((c: { id: string; name: string; status: string; objective: string; daily_budget: string; created_time: string }) => ({
      ...c,
      insights: insights[c.id] ?? null,
    }));

    return NextResponse.json({ success: true, campaigns, total: campaigns.length });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/campaigns — create new campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, name, objective, dailyBudget, startTime, stopTime, status = "PAUSED" } = body;

    const payload: Record<string, unknown> = {
      name,
      objective,
      status,
      special_ad_categories: [],
    };
    if (dailyBudget) payload.daily_budget = Math.round(parseFloat(dailyBudget) * 100); // convert to paise
    if (startTime) payload.start_time = startTime;
    if (stopTime) payload.stop_time = stopTime;

    const result = await fbPost(`/${accountId}/campaigns`, payload);
    return NextResponse.json({ success: !result.error, data: result });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
