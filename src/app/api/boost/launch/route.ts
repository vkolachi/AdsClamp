import { NextRequest, NextResponse } from "next/server";
import { fbPost } from "@/lib/fb";

const IG_ACCOUNTS: Record<string, { igId: string; pageId: string }> = {
  "act_847070334908835":  { igId: "17841480511003826", pageId: "1165372719994282" },
  "act_1298292948828360": { igId: "17841436415866415", pageId: "1166770609859650" },
};

// POST /api/boost/launch
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountId,
      reelId,           // Instagram media ID
      campaignName,
      dailyBudget,      // in INR
      durationDays,
      ageMin = 18,
      ageMax = 45,
      objective = "OUTCOME_TRAFFIC",
      destinationUrl,
      callToAction = "LEARN_MORE",
    } = body;

    const ig = IG_ACCOUNTS[accountId];
    if (!ig) return NextResponse.json({ success: false, error: "Unknown account" }, { status: 400 });

    const budgetPaise = Math.round(parseFloat(dailyBudget) * 100);
    const now = new Date();
    const stopDate = new Date(now.getTime() + parseInt(durationDays) * 24 * 60 * 60 * 1000);

    // Step 1: Create Campaign
    const campaign = await fbPost(`/${accountId}/campaigns`, {
      name: campaignName,
      objective,
      status: "PAUSED",
      special_ad_categories: [],
    });

    if (campaign.error) {
      return NextResponse.json({ success: false, error: campaign.error.message, step: "campaign" });
    }
    const campaignId = campaign.id;

    // Step 2: Create Ad Set
    const adset = await fbPost(`/${accountId}/adsets`, {
      name: `${campaignName} — Ad Set`,
      campaign_id: campaignId,
      daily_budget: budgetPaise,
      start_time: now.toISOString(),
      end_time: stopDate.toISOString(),
      billing_event: "IMPRESSIONS",
      optimization_goal: objective === "OUTCOME_TRAFFIC" ? "LINK_CLICKS" : "REACH",
      status: "PAUSED",
      targeting: {
        geo_locations: { countries: ["IN"] },
        age_min: ageMin,
        age_max: ageMax,
        publisher_platforms: ["facebook", "instagram"],
        facebook_positions: ["feed", "reels"],
        instagram_positions: ["stream", "reels"],
      },
      instagram_actor_id: ig.igId,
    });

    if (adset.error) {
      return NextResponse.json({ success: false, error: adset.error.message, step: "adset", campaignId });
    }
    const adsetId = adset.id;

    // Step 3: Create Ad Creative using existing Instagram reel
    const creative = await fbPost(`/${accountId}/adcreatives`, {
      name: `${campaignName} — Creative`,
      object_story_spec: {
        page_id: ig.pageId,
        instagram_actor_id: ig.igId,
        video_data: {
          video_id: reelId,
          call_to_action: {
            type: callToAction,
            value: { link: destinationUrl },
          },
        },
      },
    });

    if (creative.error) {
      return NextResponse.json({ success: false, error: creative.error.message, step: "creative", campaignId, adsetId });
    }
    const creativeId = creative.id;

    // Step 4: Create Ad
    const ad = await fbPost(`/${accountId}/ads`, {
      name: `${campaignName} — Ad`,
      adset_id: adsetId,
      creative: { creative_id: creativeId },
      status: "PAUSED",
    });

    if (ad.error) {
      return NextResponse.json({ success: false, error: ad.error.message, step: "ad", campaignId, adsetId, creativeId });
    }

    return NextResponse.json({
      success: true,
      campaignId,
      adsetId,
      creativeId,
      adId: ad.id,
      message: "Ad created successfully in PAUSED state. Review and activate from Campaigns page.",
    });

  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
