// Client-safe account config (no secrets)
export const AD_ACCOUNTS = [
  { id: "act_847070334908835", label: "DealClamp", brand: "dealclamp", url: "https://dealclamp.com", color: "#4f6ef7" },
  { id: "act_441178446010655", label: "LootClamp", brand: "lootclamp", url: "https://lootclamp.com", color: "#a855f7" },
];

export function getAccountById(id: string) {
  return AD_ACCOUNTS.find(a => a.id === id) ?? AD_ACCOUNTS[0];
}
