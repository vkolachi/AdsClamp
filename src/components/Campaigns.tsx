"use client";
import { useEffect, useState } from "react";
import { Play, Pause, Trash2, PlusCircle, RefreshCw, Search } from "lucide-react";
import { getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface Campaign {
  id: string; name: string; status: string; objective: string;
  daily_budget?: string; created_time: string;
  insights?: { spend: string; clicks: string; impressions: string; ctr: string } | null;
}

export default function Campaigns({ accountId, setPage }: { accountId: string; setPage: (p: Page) => void }) {
  const account = getAccountById(accountId);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/campaigns?account=${accountId}`);
      const j = await r.json();
      setCampaigns(j.campaigns ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [accountId]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const updateStatus = async (id: string, status: "ACTIVE" | "PAUSED") => {
    setActing(id);
    try {
      const r = await fetch(`/api/campaigns/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const j = await r.json();
      if (j.success) { showToast(`Campaign ${status === "ACTIVE" ? "started ▶" : "paused ⏸"}`); load(); }
      else showToast("Error: " + j.error);
    } catch { showToast("Request failed"); }
    setActing(null);
  };

  const deleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActing(id);
    try {
      const r = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (j.success) { showToast("Campaign deleted 🗑"); load(); }
      else showToast("Error: " + j.error);
    } catch { showToast("Request failed"); }
    setActing(null);
  };

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { ACTIVE: "badge-active", PAUSED: "badge-paused", DELETED: "badge-deleted", ARCHIVED: "badge-deleted" };
    return <span className={`badge ${map[s] ?? "badge-draft"}`}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />{s}</span>;
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Campaigns</div>
          <div className="topbar-sub" style={{ color: account.color }}>{account.label} · {campaigns.length} total</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} className={loading ? "spin" : ""} />Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage("create")}><PlusCircle size={12} />New Campaign</button>
        </div>
      </div>

      <div className="content fade-up">
        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <div className="empty-title">{search ? "No campaigns match your search" : "No campaigns yet"}</div>
              <div className="empty-sub">Create your first campaign to start running ads on Facebook, Instagram & Threads</div>
              {!search && <button className="btn btn-primary" onClick={() => setPage("create")}><PlusCircle size={14} />Create Campaign</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Status</th>
                    <th>Objective</th>
                    <th>Daily Budget</th>
                    <th>Spend</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{c.id}</div>
                      </td>
                      <td>{statusBadge(c.status)}</td>
                      <td style={{ fontSize: 11, color: "var(--text-sub)" }}>{c.objective?.replace("OUTCOME_", "") ?? "—"}</td>
                      <td style={{ fontWeight: 600 }}>{c.daily_budget ? `₹${(parseInt(c.daily_budget) / 100).toFixed(0)}` : "—"}</td>
                      <td style={{ color: "#4f6ef7", fontWeight: 700 }}>₹{parseFloat(c.insights?.spend ?? "0").toFixed(2)}</td>
                      <td>{parseInt(c.insights?.clicks ?? "0").toLocaleString()}</td>
                      <td>{parseFloat(c.insights?.ctr ?? "0").toFixed(2)}%</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          {c.status === "ACTIVE" ? (
                            <button className="btn btn-xs btn-ghost" disabled={acting === c.id} onClick={() => updateStatus(c.id, "PAUSED")} title="Pause">
                              <Pause size={10} />
                            </button>
                          ) : (
                            <button className="btn btn-xs btn-success" disabled={acting === c.id} onClick={() => updateStatus(c.id, "ACTIVE")} title="Start">
                              <Play size={10} />
                            </button>
                          )}
                          <button className="btn btn-xs btn-danger" disabled={acting === c.id} onClick={() => deleteCampaign(c.id, c.name)} title="Delete">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
