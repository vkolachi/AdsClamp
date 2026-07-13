import { NextRequest, NextResponse } from "next/server";
import { fbFetch, AD_ACCOUNTS } from "@/lib/fb";

// GET /api/adsets?account=act_xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("account") ?? AD_ACCOUNTS[0].id;
    const fields = "id,name,status,campaign_id,daily_budget,optimization_goal,billing_event,targeting,created_time,updated_time";

    const data = await fbFetch(`/${accountId}/adsets`, { fields, limit: "100" });

    // Get insights per adset
    let insights: Record<string, { spend: string; impressions: string; clicks: string; ctr: string }> = {};
    try {
      const insightRes = await fbFetch(`/${accountId}/insights`, {
        fields: "adset_id,spend,impressions,clicks,ctr",
        level: "adset",
        date_preset: "last_30d",
        limit: "100",
      });
      for (const row of insightRes.data ?? []) {
        insights[row.adset_id] = row;
      }
    } catch {}

    const adsets = (data.data ?? []).map((a: { id: string; name: string; status: string }) => ({
      ...a,
      insights: insights[a.id] ?? null,
    }));

    return NextResponse.json({ success: true, adsets, total: adsets.length });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
