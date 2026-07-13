"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Play, Loader, Check, ExternalLink, Zap } from "lucide-react";
import { getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface Reel {
  id: string; media_type: string; caption?: string;
  timestamp: string; permalink?: string;
  thumbnail_url?: string; media_url?: string;
}

const CTA_OPTIONS = [
  { value: "JOIN_GROUP",    label: "Join Now" },
  { value: "LEARN_MORE",   label: "Learn More" },
  { value: "SUBSCRIBE",    label: "Subscribe" },
  { value: "SIGN_UP",      label: "Sign Up" },
  { value: "GET_OFFER",    label: "Get Offer" },
  { value: "SHOP_NOW",     label: "Shop Now" },
];

const INTERESTS_PRESETS = [
  { label: "Online Shopping", value: "online_shopping" },
  { label: "Deals & Discounts", value: "deals" },
  { label: "Amazon India", value: "amazon" },
  { label: "Flipkart", value: "flipkart" },
  { label: "Fashion", value: "fashion" },
  { label: "Electronics", value: "electronics" },
];

export default function BoostReel({ accountId, setPage }: { accountId: string; setPage: (p: Page) => void }) {
  const account = getAccountById(accountId);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [selected, setSelected] = useState<Reel | null>(null);
  const [step, setStep] = useState(0); // 0=pick reel, 1=config, 2=review, 3=done
  const [launching, setLaunching] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; campaignId?: string } | null>(null);

  const [form, setForm] = useState({
    campaignName: "",
    dailyBudget: "200",
    durationDays: "7",
    ageMin: "18",
    ageMax: "45",
    destinationUrl: account.url,
    callToAction: "JOIN_GROUP",
    objective: "OUTCOME_TRAFFIC",
  });

  useEffect(() => {
    const loadReels = async () => {
      setLoadingReels(true);
      try {
        const r = await fetch(`/api/boost/reels?account=${accountId}`);
        const j = await r.json();
        setReels(j.reels ?? []);
      } catch {}
      setLoadingReels(false);
    };
    loadReels();
  }, [accountId]);

  useEffect(() => {
    if (selected) {
      const caption = selected.caption?.split("\n")[0]?.slice(0, 60) ?? "Reel Ad";
      setForm(f => ({ ...f, campaignName: `${account.label} — ${caption}` }));
    }
  }, [selected]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const launch = async () => {
    if (!selected) return;
    setLaunching(true);
    try {
      const r = await fetch("/api/boost/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, reelId: selected.id, ...form }),
      });
      const j = await r.json();
      setResult(j);
      setStep(3);
    } catch (e: unknown) {
      setResult({ success: false, error: (e as Error).message });
      setStep(3);
    }
    setLaunching(false);
  };

  const fmtDate = (ts: string) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const totalBudget = parseFloat(form.dailyBudget || "0") * parseInt(form.durationDays || "1");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} style={{ color: "#f59e0b" }} /> Boost Instagram Reel
          </div>
          <div className="topbar-sub" style={{ color: account.color }}>{account.label} · Run ads on your existing reels</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage("campaigns")}><ArrowLeft size={12} /> Back</button>
      </div>

      <div className="content fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Step 0 — Pick Reel */}
        {step === 0 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Select a Reel to Boost</div>
            <div className="card-sub" style={{ marginBottom: 20 }}>Your Instagram reels from @{account.brand}</div>

            {loadingReels ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />)}
              </div>
            ) : reels.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <div className="empty-title">No reels found</div>
                <div className="empty-sub">Post a reel on your Instagram page first, then come back to boost it.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reels.map(r => (
                  <button key={r.id} onClick={() => setSelected(r)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                      borderRadius: 12, border: "1px solid",
                      borderColor: selected?.id === r.id ? account.color + "80" : "var(--border)",
                      background: selected?.id === r.id ? account.color + "10" : "var(--surface2)",
                      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                    }}>
                    {/* Thumbnail */}
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: "var(--surface)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                      {r.thumbnail_url ? (
                        <img src={r.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Play size={20} style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.caption ? r.caption.split("\n")[0].slice(0, 80) : `Reel — ${r.id}`}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                        📅 {fmtDate(r.timestamp)} · ID: {r.id}
                      </div>
                    </div>
                    {/* Check */}
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid", borderColor: selected?.id === r.id ? account.color : "var(--border)", background: selected?.id === r.id ? account.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected?.id === r.id && <Check size={11} color="#fff" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                  Next: Configure Ad →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Configure */}
        {step === 1 && selected && (
          <>
            {/* Selected reel preview */}
            <div style={{ padding: "12px 16px", background: account.color + "10", border: `1px solid ${account.color}30`, borderRadius: 10, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <Play size={16} style={{ color: account.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: account.color }}>Selected Reel</div>
                <div style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selected.caption?.split("\n")[0].slice(0, 80) ?? selected.id}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>Change</button>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Campaign Settings</div>

              <div className="form-group">
                <label className="form-label">Campaign Name</label>
                <input className="form-input" value={form.campaignName} onChange={e => set("campaignName", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Objective</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { v: "OUTCOME_TRAFFIC", l: "🔗 Traffic" },
                    { v: "OUTCOME_AWARENESS", l: "👁 Awareness" },
                    { v: "OUTCOME_ENGAGEMENT", l: "❤️ Engagement" },
                    { v: "OUTCOME_SALES", l: "🛒 Sales" },
                  ].map(o => (
                    <button key={o.v} onClick={() => set("objective", o.v)}
                      className="btn btn-ghost btn-sm"
                      style={{ opacity: form.objective === o.v ? 1 : 0.5, borderColor: form.objective === o.v ? account.color : undefined, color: form.objective === o.v ? account.color : undefined }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Daily Budget (₹)</label>
                  <input className="form-input" type="number" min="100" value={form.dailyBudget} onChange={e => set("dailyBudget", e.target.value)} />
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Min ₹100/day</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (days)</label>
                  <input className="form-input" type="number" min="1" max="90" value={form.durationDays} onChange={e => set("durationDays", e.target.value)} />
                </div>
              </div>

              <div style={{ padding: "10px 14px", background: "rgba(79,110,247,0.08)", borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
                💰 Total estimated spend: <strong style={{ color: "#4f6ef7" }}>₹{totalBudget.toLocaleString("en-IN")}</strong> over {form.durationDays} days
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age Min</label>
                  <input className="form-input" type="number" min="18" max="65" value={form.ageMin} onChange={e => set("ageMin", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age Max</label>
                  <input className="form-input" type="number" min="18" max="65" value={form.ageMax} onChange={e => set("ageMax", e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Destination URL</label>
                {/* Quick select */}
                <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "🔗 Join Page",       url: account.url },
                    { label: "💬 WhatsApp Channel", url: `${account.url}?ref=whatsapp` },
                    { label: "✈️ Telegram",         url: `${account.url}?ref=telegram` },
                  ].map(q => (
                    <button key={q.label} type="button"
                      onClick={() => set("destinationUrl", q.url)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 10, opacity: form.destinationUrl === q.url ? 1 : 0.55, borderColor: form.destinationUrl === q.url ? account.color : undefined, color: form.destinationUrl === q.url ? account.color : undefined }}>
                      {q.label}
                    </button>
                  ))}
                </div>
                <input className="form-input" type="url" placeholder={account.url} value={form.destinationUrl} onChange={e => set("destinationUrl", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Call to Action Button</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CTA_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => set("callToAction", c.value)}
                      className="btn btn-ghost btn-sm"
                      style={{ opacity: form.callToAction === c.value ? 1 : 0.5, borderColor: form.callToAction === c.value ? account.color : undefined, color: form.callToAction === c.value ? account.color : undefined }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-ghost" onClick={() => setStep(0)}><ArrowLeft size={13} /> Back</button>
              <button className="btn btn-primary" disabled={!form.campaignName || !form.dailyBudget || !form.destinationUrl} onClick={() => setStep(2)}>
                Review →
              </button>
            </div>
          </>
        )}

        {/* Step 2 — Review */}
        {step === 2 && selected && (
          <>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Review & Launch</div>

              {[
                { label: "Account",        value: account.label },
                { label: "Reel",           value: selected.caption?.split("\n")[0].slice(0,60) ?? selected.id },
                { label: "Campaign Name",  value: form.campaignName },
                { label: "Objective",      value: form.objective.replace("OUTCOME_", "") },
                { label: "Daily Budget",   value: `₹${form.dailyBudget}/day` },
                { label: "Duration",       value: `${form.durationDays} days` },
                { label: "Total Budget",   value: `₹${totalBudget.toLocaleString("en-IN")}` },
                { label: "Age Range",      value: `${form.ageMin}–${form.ageMax} years` },
                { label: "Location",       value: "India 🇮🇳" },
                { label: "Platforms",      value: "Facebook Reels + Instagram Reels" },
                { label: "CTA Button",     value: form.callToAction.replace(/_/g, " ") },
                { label: "Destination",    value: form.destinationUrl },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 700, maxWidth: 320, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</span>
                </div>
              ))}

              <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 12, color: "var(--yellow)", lineHeight: 1.6 }}>
                ⚠️ Ad will be created in <strong>PAUSED</strong> state. You can review it in Campaigns and activate when ready.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={13} /> Back</button>
              <button className="btn btn-primary" disabled={launching} onClick={launch} style={{ background: "linear-gradient(135deg, #4f6ef7, #a855f7)", gap: 8 }}>
                {launching ? <><Loader size={14} className="spin" /> Launching…</> : <><Zap size={14} /> Launch Boost</>}
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Done */}
        {step === 3 && result && (
          <div className="card" style={{ textAlign: "center", padding: "40px 32px" }}>
            {result.success ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Boost Created!</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
                  Your reel ad has been created in <strong style={{ color: "#f59e0b" }}>PAUSED</strong> state.<br />
                  Review it and activate when you're ready.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={() => setPage("campaigns")}>
                    <Play size={13} /> View Campaigns
                  </button>
                  <a className="btn btn-ghost" href="https://business.facebook.com/adsmanager" target="_blank" rel="noreferrer">
                    <ExternalLink size={13} /> Open Ads Manager
                  </a>
                  <button className="btn btn-ghost" onClick={() => { setStep(0); setSelected(null); setResult(null); }}>
                    Boost Another Reel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--red)", marginBottom: 8 }}>Launch Failed</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Step: {(result as Record<string, unknown>).step as string ?? "unknown"}</div>
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "var(--red)", marginBottom: 20, textAlign: "left" }}>
                  {result.error}
                </div>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Try Again</button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
