"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader } from "lucide-react";
import { getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

const OBJECTIVES = [
  { value: "OUTCOME_AWARENESS", label: "Brand Awareness", desc: "Reach people likely to remember your ad", icon: "👁" },
  { value: "OUTCOME_TRAFFIC", label: "Traffic", desc: "Send people to your website or app", icon: "🔗" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement", desc: "Get more likes, comments and shares", icon: "❤️" },
  { value: "OUTCOME_LEADS", label: "Lead Generation", desc: "Collect leads for your business", icon: "📋" },
  { value: "OUTCOME_APP_PROMOTION", label: "App Promotion", desc: "Get more app installs", icon: "📱" },
  { value: "OUTCOME_SALES", label: "Sales", desc: "Find people likely to purchase", icon: "🛒" },
];

const PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "#1877f2", icon: "f" },
  { id: "instagram", label: "Instagram", color: "#e1306c", icon: "ig" },
  { id: "threads", label: "Threads", color: "#aaa", icon: "T" },
];

export default function CreateCampaign({ accountId, setPage }: { accountId: string; setPage: (p: Page) => void }) {
  const account = getAccountById(accountId);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    objective: "",
    dailyBudget: "",
    startTime: "",
    stopTime: "",
    platforms: ["facebook", "instagram", "threads"],
    status: "PAUSED",
  });

  const set = (k: string, v: string | string[]) => setForm(f => ({ ...f, [k]: v }));
  const togglePlatform = (id: string) => {
    const cur = form.platforms;
    set("platforms", cur.includes(id) ? cur.filter(p => p !== id) : [...cur, id]);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, ...form }),
      });
      const j = await r.json();
      if (j.success && !j.data?.error) {
        showToast("🎉 Campaign created successfully!");
        setTimeout(() => setPage("campaigns"), 1500);
      } else {
        setError(j.data?.error?.message ?? j.error ?? "Failed to create campaign");
      }
    } catch { setError("Network error — please try again"); }
    setLoading(false);
  };

  const steps = ["Objective", "Details", "Platforms", "Review"];
  const canNext = [
    form.objective !== "",
    form.name.trim() !== "" && form.dailyBudget !== "",
    form.platforms.length > 0,
    true,
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Create Campaign</div>
          <div className="topbar-sub" style={{ color: account.color }}>{account.label}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage("campaigns")}><ArrowLeft size={12} /> Back</button>
      </div>

      <div className="content fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Wizard steps */}
        <div className="wizard-steps" style={{ marginBottom: 28 }}>
          {steps.map((s, i) => (
            <>
              <div key={s} className={`wizard-step ${i === step ? "active" : i < step ? "done" : ""}`}>
                <div className="step-num">{i < step ? <Check size={10} /> : i + 1}</div>
                {s}
              </div>
              {i < steps.length - 1 && <div key={`div-${i}`} className="step-divider" />}
            </>
          ))}
        </div>

        {/* Step 0 — Objective */}
        {step === 0 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Choose Campaign Objective</div>
            <div className="card-sub" style={{ marginBottom: 16 }}>What's the main goal of your campaign?</div>
            <div className="grid-2" style={{ gap: 10 }}>
              {OBJECTIVES.map(o => (
                <button key={o.value} onClick={() => set("objective", o.value)}
                  style={{
                    padding: "14px", borderRadius: 10, textAlign: "left", border: "1px solid",
                    borderColor: form.objective === o.value ? "var(--accent)" : "var(--border)",
                    background: form.objective === o.value ? "var(--accent-glow)" : "var(--surface2)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{o.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{o.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Campaign Details</div>
            <div className="form-group">
              <label className="form-label">Campaign Name *</label>
              <input className="form-input" placeholder={`e.g. ${account.label} - Summer Sale 2026`} value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Budget (₹) *</label>
              <input className="form-input" type="number" placeholder="e.g. 500" value={form.dailyBudget} onChange={e => set("dailyBudget", e.target.value)} />
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>Minimum ₹100/day recommended</div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="datetime-local" value={form.startTime} onChange={e => set("startTime", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="datetime-local" value={form.stopTime} onChange={e => set("stopTime", e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Launch Status</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["PAUSED", "ACTIVE"].map(s => (
                  <button key={s} onClick={() => set("status", s)}
                    className={s === "ACTIVE" ? "btn btn-success btn-sm" : "btn btn-ghost btn-sm"}
                    style={{ opacity: form.status === s ? 1 : 0.5, borderWidth: form.status === s ? 2 : 1 }}>
                    {s === "ACTIVE" ? "▶ Start Immediately" : "⏸ Save as Draft"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Platforms */}
        {step === 2 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Select Platforms</div>
            <div className="card-sub" style={{ marginBottom: 16 }}>Your ad will run on all selected platforms simultaneously</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PLATFORMS.map(p => {
                const selected = form.platforms.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px",
                      borderRadius: 10, border: "1px solid",
                      borderColor: selected ? p.color + "60" : "var(--border)",
                      background: selected ? p.color + "10" : "var(--surface2)",
                      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                    }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: p.color, fontSize: 13 }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Run ads on {p.label} feed, stories & reels</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid", borderColor: selected ? p.color : "var(--border)", background: selected ? p.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected && <Check size={10} color="#fff" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Review & Launch</div>
            {[
              { label: "Account", value: account.label },
              { label: "Campaign Name", value: form.name },
              { label: "Objective", value: form.objective.replace("OUTCOME_", "") },
              { label: "Daily Budget", value: `₹${form.dailyBudget}/day` },
              { label: "Platforms", value: form.platforms.join(", ") },
              { label: "Status", value: form.status },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{r.label}</span>
                <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
            {error && <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "var(--red)" }}>⚠️ {error}</div>}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => step > 0 ? setStep(s => s - 1) : setPage("campaigns")}>
            <ArrowLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button className="btn btn-primary" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" disabled={loading} onClick={submit}>
              {loading ? <><Loader size={14} className="spin" /> Creating…</> : "🚀 Launch Campaign"}
            </button>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
