// Client-safe account config (no secrets)
export const AD_ACCOUNTS = [
  { id: "act_847070334908835",  label: "DealClamp", brand: "dealclamp", url: "https://join.dealclamp.com", color: "#4f6ef7" },
  { id: "act_1298292948828360", label: "LootClamp", brand: "lootclamp", url: "https://join.lootclamp.com", color: "#a855f7" },
];

export function getAccountById(id: string) {
  return AD_ACCOUNTS.find(a => a.id === id) ?? AD_ACCOUNTS[0];
}
