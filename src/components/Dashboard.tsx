"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Eye, MousePointerClick, DollarSign, RefreshCw, PlusCircle, BarChart2, Layers, ArrowUpRight } from "lucide-react";
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

  const fmt   = (v?: string) => v ? parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0";
  const fmtRs = (v?: string) => v ? `₹${parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "₹0";

  const stats = [
    { label: "Total Spend",  value: fmtRs(insight?.spend),       icon: DollarSign,       color: "#4f6ef7", sub: "Campaign budget used" },
    { label: "Impressions",  value: fmt(insight?.impressions),    icon: Eye,              color: "#22c55e", sub: "Total ad views" },
    { label: "Clicks",       value: fmt(insight?.clicks),         icon: MousePointerClick,color: "#a855f7", sub: "Link clicks" },
    { label: "CTR",          value: insight?.ctr ? `${parseFloat(insight.ctr).toFixed(2)}%` : "0%", icon: TrendingUp, color: "#f59e0b", sub: "Click-through rate" },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="brand-dot" style={{ background: account.color, boxShadow: `0 0 8px ${account.color}`, width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
            {account.label} — Overview
          </div>
          <div className="topbar-sub">Real-time performance · {preset.replace("_", " ")}</div>
        </div>
        <div className="topbar-actions">
          <select className="form-select" style={{ width: "auto", padding: "5px 10px", fontSize: 11 }} value={preset} onChange={e => setPreset(e.target.value)}>
            <option value="today">Today</option>
            <option value="last_7d">Last 7 days</option>
            <option value="last_30d">Last 30 days</option>
            <option value="this_month">This month</option>
            <option value="last_90d">Last 90 days</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage("create")}>
            <PlusCircle size={12} /> New Campaign
          </button>
        </div>
      </div>

      <div className="content fade-up">
        {/* Platform badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
          {[
            { label: "Facebook",  cls: "chip-fb", icon: "f" },
            { label: "Instagram", cls: "chip-ig", icon: "ig" },
            { label: "Threads",   cls: "chip-th", icon: "T" },
          ].map(p => (
            <span key={p.label} className={`platform-chip ${p.cls}`}>
              <span style={{ fontWeight: 900 }}>{p.icon}</span> {p.label}
            </span>
          ))}
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>• All platforms active</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
            Account: <code style={{ background: "var(--surface2)", padding: "1px 6px", borderRadius: 4, color: account.color }}>{account.id}</code>
          </span>
        </div>

        {/* Stat cards */}
        <div className="stat-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div className="stat-value">
                {loading ? <span className="skeleton" style={{ display: "inline-block", width: 90, height: 30 }} /> : s.value}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Manage Campaigns", icon: "📢", page: "campaigns" as Page, color: "#4f6ef7" },
            { label: "View Ad Sets",     icon: "🗂", page: "adsets"   as Page, color: "#a855f7" },
            { label: "Full Insights",    icon: "📊", page: "insights" as Page, color: "#22c55e" },
          ].map(q => (
            <button key={q.label} onClick={() => setPage(q.page)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                background: "var(--surface)", border: `1px solid var(--border)`, borderRadius: 12,
                cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = q.color + "60"; (e.currentTarget as HTMLElement).style.background = q.color + "08"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}>
              <span style={{ fontSize: 22 }}>{q.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{q.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Click to open →</div>
              </div>
              <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>

        {/* Campaign performance table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="card-title">Top Campaigns</div>
              <div className="card-sub">Spend & engagement last {preset.replace("_", " ")}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("campaigns")}>
              View All <ArrowUpRight size={11} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
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
                  {campaigns.slice(0, 8).map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--text)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.campaign_name}</td>
                      <td style={{ color: "#4f6ef7", fontWeight: 700 }}>₹{parseFloat(c.spend || "0").toFixed(2)}</td>
                      <td>{parseInt(c.impressions || "0").toLocaleString()}</td>
                      <td>{parseInt(c.clicks || "0").toLocaleString()}</td>
                      <td>
                        <span style={{ background: "rgba(79,110,247,0.1)", color: "#4f6ef7", padding: "2px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {parseFloat(c.ctr || "0").toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info row */}
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, padding: "12px 16px", background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.15)", borderRadius: 10, fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6 }}>
            <strong style={{ color: "#4f6ef7" }}>📡 Live Meta API</strong> — Data fetched directly from Facebook Marketing API v21.0. Ads run on <strong>Facebook</strong>, <strong>Instagram</strong> & <strong>Threads</strong>.
          </div>
          <div style={{ flex: 1, padding: "12px 16px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 10, fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6 }}>
            <strong style={{ color: "#a855f7" }}>💡 Tip</strong> — Use the brand switcher in the sidebar to toggle between DealClamp and LootClamp accounts instantly.
          </div>
        </div>
      </div>

      <div style={{ display: "none" }}>
        <BarChart2 /><Layers />
      </div>
    </>
  );
}
