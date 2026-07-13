// Facebook Marketing API helper
const FB_BASE = "https://graph.facebook.com/v21.0";

export const AD_ACCOUNTS = [
  { id: "act_847070334908835",   label: "DealClamp", brand: "dealclamp", url: "https://join.dealclamp.com", color: "#4f6ef7" },
  { id: "act_1298292948828360",  label: "LootClamp", brand: "lootclamp", url: "https://join.lootclamp.com", color: "#a855f7" },
];

function getToken() {
  return process.env.FB_ACCESS_TOKEN ?? "";
}

export async function fbFetch(path: string, params: Record<string, string> = {}) {
  const token = getToken();
  const qs = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${FB_BASE}${path}?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `FB API error ${res.status}`);
  }
  return res.json();
}

export async function fbPost(path: string, body: Record<string, unknown>) {
  const token = getToken();
  const res = await fetch(`${FB_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: token }),
  });
  return res.json();
}

export async function fbDelete(path: string) {
  const token = getToken();
  const res = await fetch(`${FB_BASE}${path}?access_token=${token}`, { method: "DELETE" });
  return res.json();
}

export function getAccountById(id: string) {
  return AD_ACCOUNTS.find(a => a.id === id) ?? AD_ACCOUNTS[0];
}
