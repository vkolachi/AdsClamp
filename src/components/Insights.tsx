"use client";
import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, DollarSign, Eye, MousePointerClick } from "lucide-react";
import { getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface CampaignInsight {
  campaign_id: string; campaign_name: string;
  spend: string; impressions: string; clicks: string;
  ctr: string; cpc: string; reach: string; frequency: string;
  date_start: string; date_stop: string;
}

export default function Insights({ accountId, setPage }: { accountId: string; setPage: (p: Page) => void }) {
  const account = getAccountById(accountId);
  const [data, setData]         = useState<CampaignInsight[]>([]);
  const [account_total, setTotal] = useState<{ spend: string; impressions: string; clicks: string; ctr: string; reach: string } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [preset, setPreset]     = useState("last_30d");
  const [breakdown, setBreakdown] = useState("campaign");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/insights?account=${accountId}&preset=${preset}&breakdown=${breakdown}`);
      const j = await r.json();
      setData(j.campaigns ?? []);
      setTotal(j.account ?? null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [accountId, preset, breakdown]);

  const fmtRs = (v?: string) => v ? `₹${parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "₹0";
  const fmt   = (v?: string) => v ? parseInt(v).toLocaleString("en-IN") : "0";

  const totalSpend       = data.reduce((s, r) => s + parseFloat(r.spend || "0"), 0);
  const totalImpressions = data.reduce((s, r) => s + parseInt(r.impressions || "0"), 0);
  const totalClicks      = data.reduce((s, r) => s + parseInt(r.clicks || "0"), 0);
  const avgCTR           = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const avgCPC           = totalClicks > 0 ? totalSpend / totalClicks : 0;

  const maxSpend = Math.max(...data.map(r => parseFloat(r.spend || "0")), 1);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Insights</div>
          <div className="topbar-sub" style={{ color: account.color }}>{account.label} · Performance analytics</div>
        </div>
        <div className="topbar-actions">
          <select className="form-select" style={{ height: 32, fontSize: 11, paddingInline: 10, width: "auto" }} value={preset} onChange={e => setPreset(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7d">Last 7 days</option>
            <option value="last_14d">Last 14 days</option>
            <option value="last_30d">Last 30 days</option>
            <option value="this_month">This month</option>
            <option value="last_month">Last month</option>
            <option value="last_90d">Last 90 days</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} className={loading ? "spin" : ""} />Refresh</button>
        </div>
      </div>

      <div className="content fade-up">
        {/* Summary stat cards */}
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 20 }}>
          {[
            { label: "Total Spend",   value: `₹${totalSpend.toFixed(2)}`,     icon: DollarSign,        color: "#4f6ef7" },
            { label: "Impressions",   value: fmt(String(totalImpressions)),    icon: Eye,               color: "#22c55e" },
            { label: "Clicks",        value: fmt(String(totalClicks)),         icon: MousePointerClick, color: "#a855f7" },
            { label: "Avg CTR",       value: `${avgCTR.toFixed(2)}%`,         icon: TrendingUp,        color: "#f59e0b" },
            { label: "Avg CPC",       value: `₹${avgCPC.toFixed(2)}`,         icon: DollarSign,        color: "#06b6d4" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={13} style={{ color: s.color }} />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {loading ? <span className="skeleton" style={{ display: "inline-block", width: 70, height: 22 }} /> : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Campaign breakdown bar chart */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="card-title">Spend by Campaign</div>
              <div className="card-sub">Visual breakdown for {preset.replace(/_/g, " ")}</div>
            </div>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />)}
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-icon">📈</div>
              <div className="empty-title">No data for this period</div>
              <div className="empty-sub">Try selecting a different date range</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.sort((a, b) => parseFloat(b.spend) - parseFloat(a.spend)).map(row => {
                const spend = parseFloat(row.spend || "0");
                const pct   = (spend / maxSpend) * 100;
                return (
                  <div key={row.campaign_id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.campaign_name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#4f6ef7", flexShrink: 0, marginLeft: 12 }}>
                        ₹{spend.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, #4f6ef7, #a855f7)`, borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 5, fontSize: 10, color: "var(--text-muted)" }}>
                      <span>{fmt(row.impressions)} impressions</span>
                      <span>{fmt(row.clicks)} clicks</span>
                      <span>{parseFloat(row.ctr || "0").toFixed(2)}% CTR</span>
                      <span>₹{parseFloat(row.cpc || "0").toFixed(2)} CPC</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full data table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">Detailed Breakdown</div>
            <div className="card-sub">All metrics by campaign for {preset.replace(/_/g, " ")}</div>
          </div>
          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Spend</th>
                    <th>Reach</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>CPC</th>
                    <th>Frequency</th>
                    <th>Period</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--text)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.campaign_name}</td>
                      <td style={{ color: "#4f6ef7", fontWeight: 700 }}>₹{parseFloat(row.spend || "0").toFixed(2)}</td>
                      <td>{parseInt(row.reach || "0").toLocaleString()}</td>
                      <td>{parseInt(row.impressions || "0").toLocaleString()}</td>
                      <td>{parseInt(row.clicks || "0").toLocaleString()}</td>
                      <td><span style={{ background: "rgba(79,110,247,0.1)", color: "#4f6ef7", padding: "1px 6px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{parseFloat(row.ctr || "0").toFixed(2)}%</span></td>
                      <td>₹{parseFloat(row.cpc || "0").toFixed(2)}</td>
                      <td>{parseFloat(row.frequency || "0").toFixed(2)}x</td>
                      <td style={{ fontSize: 10, color: "var(--text-muted)" }}>{row.date_start} → {row.date_stop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
