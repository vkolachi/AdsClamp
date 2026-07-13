import { NextRequest, NextResponse } from "next/server";
import { fbFetch, AD_ACCOUNTS } from "@/lib/fb";

// GET /api/insights?account=act_xxx&preset=last_30d
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("account") ?? AD_ACCOUNTS[0].id;
    const preset = searchParams.get("preset") ?? "last_30d";

    // Fetch account-level insights
    const [accountInsights, campaignInsights] = await Promise.allSettled([
      fbFetch(`/${accountId}/insights`, {
        fields: "spend,impressions,clicks,ctr,cpc,reach,frequency,actions,cost_per_action_type",
        date_preset: preset,
      }),
      fbFetch(`/${accountId}/insights`, {
        fields: "campaign_name,campaign_id,spend,impressions,clicks,ctr,cpc,reach",
        level: "campaign",
        date_preset: preset,
        limit: "20",
      }),
    ]);

    return NextResponse.json({
      success: true,
      account: accountInsights.status === "fulfilled" ? accountInsights.value.data?.[0] ?? null : null,
      campaigns: campaignInsights.status === "fulfilled" ? campaignInsights.value.data ?? [] : [],
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
