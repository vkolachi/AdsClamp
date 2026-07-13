import { NextResponse } from "next/server";
import { fbFetch, AD_ACCOUNTS } from "@/lib/fb";

// GET /api/billing — fetch billing summary for both accounts
export async function GET() {
  try {
    const fields = "id,name,currency,balance,amount_spent,spend_cap,funding_source_details,account_status";

    const results = await Promise.allSettled(
      AD_ACCOUNTS.map(a => fbFetch(`/${a.id}`, { fields }))
    );

    const accounts = AD_ACCOUNTS.map((a, idx) => {
      const res = results[idx];
      if (res.status === "fulfilled" && !res.value.error) {
        return {
          id: a.id,
          label: a.label,
          brand: a.brand,
          color: a.color,
          data: res.value,
        };
      }
      return {
        id: a.id,
        label: a.label,
        brand: a.brand,
        color: a.color,
        data: null,
        error: res.status === "rejected" ? res.reason?.message : res.value?.error?.message,
      };
    });

    return NextResponse.json({ success: true, accounts });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
