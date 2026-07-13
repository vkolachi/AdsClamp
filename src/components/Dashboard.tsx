"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Eye, MousePointerClick, DollarSign, RefreshCw, PlusCircle } from "lucide-react";
import { getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface Insight { spend: string; impressions: string; clicks: string; ctr: string; cpc: string; reach: string; }
interface CampaignRow { campaign_id: string; campaign_name: string; spend: string; impressions: string; clicks: string; ctr: string; }

export default function Dashboard({ accountId, setPage }: { accountId: string; setPage: (p: Page) => void }) {
  const account = getAccountById(accountId);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("last_30d");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/insights?account=${accountId}&preset=${preset}`);
      const j = await r.json();
      setInsight(j.account);
      setCampaigns(j.campaigns ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [accountId, preset]);

  const fmt = (v?: string) => v ? parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0";
  const fmtRs = (v?: string) => v ? `₹${parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "₹0";

  const stats = [
    { label: "Total Spend", value: fmtRs(insight?.spend), icon: DollarSign, color: "#4f6ef7" },
    { label: "Impressions", value: fmt(insight?.impressions), icon: Eye, color: "#22c55e" },
    { label: "Clicks", value: fmt(insight?.clicks), icon: MousePointerClick, color: "#a855f7" },
    { label: "CTR", value: insight?.ctr ? `${parseFloat(insight.ctr).toFixed(2)}%` : "0%", icon: TrendingUp, color: "#f59e0b" },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ color: account.color }}>● {account.label}</div>
          <div className="topbar-sub">Overview · last 30 days</div>
        </div>
        <div className="topbar-actions">
          <select className="account-select" style={{ width: "auto", padding: "5px 10px", fontSize: 11 }} value={preset} onChange={e => setPreset(e.target.value)}>
            <option value="today">Today</option>
            <option value="last_7d">Last 7 days</option>
            <option value="last_30d">Last 30 days</option>
            <option value="this_month">This month</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage("create")}>
            <PlusCircle size={12} /> Create Ad
          </button>
        </div>
      </div>

      <div className="content fade-up">
        {/* Platform badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Facebook", cls: "chip-fb", icon: "f" },
            { label: "Instagram", cls: "chip-ig", icon: "ig" },
            { label: "Threads", cls: "chip-th", icon: "T" },
          ].map(p => (
            <span key={p.label} className={`platform-chip ${p.cls}`}>
              <span style={{ fontWeight: 900 }}>{p.icon}</span> {p.label}
            </span>
          ))}
          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center", marginLeft: 4 }}>All platforms active</span>
        </div>

        {/* Stat cards */}
        <div className="stat-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div className="stat-value">
                {loading ? <span className="skeleton" style={{ display: "inline-block", width: 80, height: 28 }} /> : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Campaign performance table */}
        <div className="card" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div className="card-title">Campaign Performance</div>
              <div className="card-sub">Spend & engagement by campaign</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("campaigns")}>View All →</button>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">No campaign data yet</div>
              <div className="empty-sub">Create your first campaign to see performance here</div>
              <button className="btn btn-primary" onClick={() => setPage("create")}><PlusCircle size={14} /> Create Campaign</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Spend</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--text)" }}>{c.campaign_name}</td>
                      <td style={{ color: "#4f6ef7", fontWeight: 700 }}>₹{parseFloat(c.spend || "0").toFixed(2)}</td>
                      <td>{parseInt(c.impressions || "0").toLocaleString()}</td>
                      <td>{parseInt(c.clicks || "0").toLocaleString()}</td>
                      <td>{parseFloat(c.ctr || "0").toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info box */}
        <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.15)", borderRadius: 10, fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6 }}>
          <strong style={{ color: "#4f6ef7" }}>📡 Live Meta API</strong> — All data fetched directly from Facebook Marketing API.
          Ads run simultaneously on <strong>Facebook</strong>, <strong>Instagram</strong>, and <strong>Threads</strong> via your <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>{account.id}</code> account.
        </div>
      </div>
    </>
  );
}
