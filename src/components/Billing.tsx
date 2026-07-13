"use client";
import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, RefreshCw, ShieldAlert, CheckCircle2, Wallet, DollarSign } from "lucide-react";
import type { Page } from "@/app/page";

interface AccountBilling {
  id: string;
  label: string;
  brand: string;
  color: string;
  data?: {
    id: string;
    name: string;
    currency: string;
    balance: string;
    amount_spent: string;
    spend_cap: string;
    account_status: number;
    funding_source_details?: {
      display_string?: string;
    };
  } | null;
  error?: string;
}

export default function Billing({ setPage }: { setPage: (p: Page) => void }) {
  const [accounts, setAccounts] = useState<AccountBilling[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/billing");
      const j = await r.json();
      setAccounts(j.accounts ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const fmtCurrency = (val: string | undefined, curr = "INR") => {
    if (!val) return "₹0.00";
    const num = parseFloat(val);
    // Meta returns balance/amount_spent in standard currency units or cents depending on account
    // For INR ad accounts standard representation is numeric string
    return `${curr === "INR" ? "₹" : curr + " "}${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const cleanId = (id: string) => id.replace("act_", "");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={18} style={{ color: "#22c55e" }} /> Payment & Billing Manager
          </div>
          <div className="topbar-sub">Live balances, spend tracking & direct payment deposit for DealClamp & LootClamp</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Refresh Balances
          </button>
        </div>
      </div>

      <div className="content fade-up">
        {/* API info card explaining how adding money works */}
        <div style={{
          padding: "16px 20px",
          background: "rgba(34, 197, 94, 0.08)",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          borderRadius: 12,
          marginBottom: 24,
          display: "flex",
          gap: 14,
          alignItems: "flex-start"
        }}>
          <ShieldAlert size={20} style={{ color: "#22c55e", flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              How Adding Money Works on Meta Ad Accounts
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Meta Marketing API allows applications to read real-time <strong>balances, amount spent, and payment status</strong>. 
              Due to strict PCI-DSS banking security regulations, programmatic API deposits are not permitted. 
              Click the <strong style={{ color: "#22c55e" }}>Add Money via Meta Billing</strong> button below any brand to open that account&apos;s direct payment modal (UPI, Card, NetBanking) in one click.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid-2" style={{ gap: 20 }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 14 }} />)}
          </div>
        ) : (
          <div className="grid-2" style={{ gap: 20 }}>
            {accounts.map(acc => {
              const d = acc.data;
              const numericId = cleanId(acc.id);
              const addMoneyUrl = `https://adsmanager.facebook.com/adsmanager/billing/summary?act=${numericId}`;

              return (
                <div key={acc.id} className="card" style={{ borderTop: `4px solid ${acc.color}`, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: acc.color }}>{acc.label}</span>
                        {d?.account_status === 1 && (
                          <span className="badge badge-active" style={{ fontSize: 10 }}>
                            <CheckCircle2 size={10} /> ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 4 }}>
                        Account ID: {acc.id}
                      </div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: acc.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Wallet size={18} style={{ color: acc.color }} />
                    </div>
                  </div>

                  {d ? (
                    <>
                      {/* Financial Metrics */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "14px 16px", background: "var(--surface2)", borderRadius: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                            Available Balance
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>
                            {fmtCurrency(d.balance, d.currency)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-sub)", marginTop: 2 }}>
                            Prepaid / Remaining
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                            Lifetime Spend
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
                            {fmtCurrency(d.amount_spent, d.currency)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-sub)", marginTop: 2 }}>
                            {d.currency} Currency
                          </div>
                        </div>
                      </div>

                      {/* Payment Method info */}
                      <div style={{ fontSize: 12, color: "var(--text-sub)", display: "flex", justifyContent: "space-between", padding: "6px 2px" }}>
                        <span>Funding Source:</span>
                        <strong style={{ color: "var(--text)" }}>
                          {d.funding_source_details?.display_string || "UPI / Card / Meta Wallet"}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--red)", fontSize: 12 }}>
                      Failed to fetch billing info: {acc.error}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                    <a
                      href={addMoneyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-success"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 16px",
                        fontWeight: 700,
                        fontSize: 13,
                        background: "#22c55e",
                        color: "#fff",
                        textDecoration: "none"
                      }}
                    >
                      <DollarSign size={16} /> Add Money to {acc.label} (Meta Billing) <ExternalLink size={13} />
                    </a>

                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={`https://adsmanager.facebook.com/adsmanager/payment_methods?act=${numericId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                      >
                        Payment Methods <ExternalLink size={11} />
                      </a>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setPage("campaigns")}
                      >
                        View Campaigns
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
