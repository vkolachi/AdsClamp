"use client";
import { useEffect, useState } from "react";
import { Play, Pause, Trash2, RefreshCw, Search, Pencil, X, Check, Loader, ChevronDown } from "lucide-react";
import { getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface AdSet {
  id: string; name: string; status: string; campaign_id: string;
  daily_budget?: string; optimization_goal?: string; billing_event?: string;
  targeting?: { age_min?: number; age_max?: number };
  insights?: { spend: string; clicks: string; impressions: string; ctr: string } | null;
}

export default function AdSets({ accountId, setPage }: { accountId: string; setPage: (p: Page) => void }) {
  const account = getAccountById(accountId);
  const [adsets, setAdsets]       = useState<AdSet[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });
  const [acting, setActing]       = useState<string | null>(null);
  const [editing, setEditing]     = useState<AdSet | null>(null);
  const [editForm, setEditForm]   = useState({ name: "", daily_budget: "", status: "" });
  const [saving, setSaving]       = useState(false);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/adsets?account=${accountId}`);
      const j = await r.json();
      setAdsets(j.adsets ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [accountId]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const updateStatus = async (id: string, status: "ACTIVE" | "PAUSED") => {
    setActing(id);
    try {
      const r = await fetch(`/api/adsets/${id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const j = await r.json();
      if (j.success) { showToast(`Ad Set ${status === "ACTIVE" ? "started ▶" : "paused ⏸"}`); load(); }
      else showToast("Error: " + j.error, "error");
    } catch { showToast("Request failed", "error"); }
    setActing(null);
  };

  const deleteAdSet = async (id: string) => {
    setActing(id);
    setDelConfirm(null);
    try {
      const r = await fetch(`/api/adsets/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (j.success) { showToast("Ad Set deleted 🗑"); load(); }
      else showToast("Error: " + j.error, "error");
    } catch { showToast("Request failed", "error"); }
    setActing(null);
  };

  const openEdit = (a: AdSet) => {
    setEditing(a);
    setEditForm({ name: a.name, daily_budget: a.daily_budget ? String(parseInt(a.daily_budget) / 100) : "", status: a.status });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name: editForm.name, status: editForm.status };
      if (editForm.daily_budget) payload.daily_budget = Math.round(parseFloat(editForm.daily_budget) * 100);
      const r = await fetch(`/api/adsets/${editing.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j.success && !j.data?.error) { showToast("Ad Set updated ✓"); setEditing(null); load(); }
      else showToast("Error: " + (j.data?.error?.message ?? j.error), "error");
    } catch { showToast("Request failed", "error"); }
    setSaving(false);
  };

  const filtered = adsets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { ACTIVE: "badge-active", PAUSED: "badge-paused", DELETED: "badge-deleted", ARCHIVED: "badge-deleted" };
    return <span className={`badge ${map[s] ?? "badge-draft"}`}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />{s}</span>;
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Ad Sets</div>
          <div className="topbar-sub" style={{ color: account.color }}>{account.label} · {adsets.length} ad sets · {adsets.filter(a => a.status === "ACTIVE").length} active</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} className={loading ? "spin" : ""} />Refresh</button>
        </div>
      </div>

      <div className="content fade-up">
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input" style={{ paddingLeft: 34, height: 36 }} placeholder="Search ad sets…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ position: "relative" }}>
            <select className="form-select" style={{ height: 36, paddingRight: 28, appearance: "none", minWidth: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {["ALL","ACTIVE","PAUSED","ARCHIVED"].map(s => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Active", count: adsets.filter(a => a.status === "ACTIVE").length, color: "#22c55e" },
            { label: "Paused", count: adsets.filter(a => a.status === "PAUSED").length, color: "#f59e0b" },
            { label: "Total",  count: adsets.length,                                     color: "#4f6ef7" },
          ].map(p => (
            <div key={p.label} style={{ padding: "5px 12px", borderRadius: 8, background: `${p.color}12`, border: `1px solid ${p.color}25`, fontSize: 11, fontWeight: 700, color: p.color }}>
              {p.count} {p.label}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗂</div>
              <div className="empty-title">{search ? "No ad sets match your search" : "No ad sets found"}</div>
              <div className="empty-sub">Ad sets are created inside campaigns. Create a campaign first.</div>
              <button className="btn btn-primary" onClick={() => setPage("create")}>Create Campaign</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ad Set Name</th>
                    <th>Status</th>
                    <th>Optimization</th>
                    <th>Daily Budget</th>
                    <th>Spend</th>
                    <th>Impressions</th>
                    <th>CTR</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} style={{ opacity: acting === a.id ? 0.5 : 1, transition: "opacity 0.2s" }}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>{a.id}</div>
                      </td>
                      <td>{statusBadge(a.status)}</td>
                      <td style={{ fontSize: 11, color: "var(--text-sub)" }}>{a.optimization_goal?.replace(/_/g, " ") ?? "—"}</td>
                      <td style={{ fontWeight: 600 }}>{a.daily_budget ? `₹${(parseInt(a.daily_budget) / 100).toFixed(0)}/d` : "—"}</td>
                      <td style={{ color: "#4f6ef7", fontWeight: 700 }}>₹{parseFloat(a.insights?.spend ?? "0").toFixed(2)}</td>
                      <td>{parseInt(a.insights?.impressions ?? "0").toLocaleString()}</td>
                      <td>
                        <span style={{ background: "rgba(79,110,247,0.1)", color: "#4f6ef7", padding: "1px 6px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                          {parseFloat(a.insights?.ctr ?? "0").toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <button className="btn btn-xs btn-ghost" disabled={acting === a.id} onClick={() => openEdit(a)} title="Edit"><Pencil size={10} /></button>
                          {a.status === "ACTIVE" ? (
                            <button className="btn btn-xs btn-ghost" disabled={acting === a.id} onClick={() => updateStatus(a.id, "PAUSED")} title="Pause"><Pause size={10} /></button>
                          ) : (
                            <button className="btn btn-xs btn-success" disabled={acting === a.id} onClick={() => updateStatus(a.id, "ACTIVE")} title="Start"><Play size={10} /></button>
                          )}
                          {delConfirm === a.id ? (
                            <>
                              <button className="btn btn-xs btn-danger" onClick={() => deleteAdSet(a.id)}><Check size={10} /></button>
                              <button className="btn btn-xs btn-ghost" onClick={() => setDelConfirm(null)}><X size={10} /></button>
                            </>
                          ) : (
                            <button className="btn btn-xs btn-danger" disabled={acting === a.id} onClick={() => setDelConfirm(a.id)} title="Delete"><Trash2 size={10} /></button>
                          )}
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

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Edit Ad Set</div>
                <div className="modal-sub">{editing.id}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Ad Set Name</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Budget (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 200" value={editForm.daily_budget} onChange={e => setEditForm(f => ({ ...f, daily_budget: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["ACTIVE","PAUSED"].map(s => (
                    <button key={s} onClick={() => setEditForm(f => ({ ...f, status: s }))}
                      className={s === "ACTIVE" ? "btn btn-success btn-sm" : "btn btn-ghost btn-sm"}
                      style={{ opacity: editForm.status === s ? 1 : 0.45 }}>
                      {s === "ACTIVE" ? "▶ Active" : "⏸ Paused"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveEdit}>
                {saving ? <><Loader size={13} className="spin" /> Saving…</> : <><Check size={13} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.msg && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : ""}`}>
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}
    </>
  );
}
