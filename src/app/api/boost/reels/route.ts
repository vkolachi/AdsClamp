import { NextRequest, NextResponse } from "next/server";
import { fbFetch } from "@/lib/fb";

const IG_ACCOUNTS: Record<string, { igId: string; pageId: string; label: string }> = {
  "act_847070334908835":    { igId: "17841480511003826", pageId: "1165372719994282", label: "DealClamp" },
  "act_1298292948828360":   { igId: "17841436415866415", pageId: "1166770609859650", label: "LootClamp" },
};

// GET /api/boost/reels?account=act_xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("account") ?? "act_847070334908835";
    const ig = IG_ACCOUNTS[accountId];
    if (!ig) return NextResponse.json({ success: false, error: "Unknown account" }, { status: 400 });

    const data = await fbFetch(`/${ig.igId}/media`, {
      fields: "id,media_type,caption,timestamp,permalink,thumbnail_url,media_url",
      limit: "20",
    });

    // Filter only VIDEO (Reels)
    const reels = (data.data ?? []).filter(
      (m: { media_type: string }) => m.media_type === "VIDEO"
    );

    return NextResponse.json({ success: true, reels, igId: ig.igId, pageId: ig.pageId });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
