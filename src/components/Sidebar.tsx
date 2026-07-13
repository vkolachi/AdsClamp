"use client";
import { LayoutDashboard, Megaphone, PlusCircle, ExternalLink, BarChart2, Layers, ChevronRight, Zap, CreditCard } from "lucide-react";
import { AD_ACCOUNTS, getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  accountId: string;
  setAccountId: (id: string) => void;
}

const NAV = [
  { id: "dashboard", label: "Overview",      icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns",     icon: Megaphone },
  { id: "adsets",    label: "Ad Sets",       icon: Layers },
  { id: "insights",  label: "Insights",      icon: BarChart2 },
  { id: "boost",     label: "Boost Reel",    icon: Zap },
  { id: "billing",   label: "Billing & Funds", icon: CreditCard },
  { id: "create",    label: "Create Ad",     icon: PlusCircle },
] as const;

export default function Sidebar({ page, setPage, accountId, setAccountId }: Props) {
  const account = getAccountById(accountId);
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">AdsClamp</div>
            <div className="logo-sub">Meta Ads Manager</div>
          </div>
        </div>
      </div>

      {/* Brand switcher */}
      <div style={{ padding: "10px 10px 0" }}>
        <div className="account-switcher-label" style={{ paddingLeft: 4, marginBottom: 6 }}>Active Brand</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {AD_ACCOUNTS.map(a => (
            <button
              key={a.id}
              onClick={() => setAccountId(a.id)}
              className={`brand-btn ${accountId === a.id ? "brand-btn-active" : ""}`}
              style={{ borderColor: accountId === a.id ? a.color + "60" : undefined }}
            >
              <div className="brand-dot" style={{ background: a.color, boxShadow: accountId === a.id ? `0 0 8px ${a.color}` : "none" }} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: accountId === a.id ? a.color : "var(--text)" }}>{a.label}</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>{a.url}</div>
              </div>
              {accountId === a.id && <ChevronRight size={12} style={{ color: a.color }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section" style={{ marginTop: 12 }}>
        <div className="sidebar-label">Navigation</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id as Page)}>
            <Icon size={15} />
            {label}
            {id === "create" && <span style={{ marginLeft: "auto", fontSize: 9, background: "var(--accent)", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 800 }}>NEW</span>}
            {id === "boost" && <span style={{ marginLeft: "auto", fontSize: 9, background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 800 }}>⚡</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-section" style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <div className="sidebar-label">Quick Links</div>
        {[
          { label: "DealClamp Site",    url: "https://dealclamp.com",               color: "#4f6ef7" },
          { label: "LootClamp Site",    url: "https://lootclamp.com",               color: "#a855f7" },
          { label: "Meta Ads Manager",  url: "https://business.facebook.com/adsmanager", color: "#1877f2" },
          { label: "Meta Business",     url: "https://business.facebook.com/settings", color: "#1877f2" },
        ].map(l => (
          <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
            className="nav-item" style={{ color: l.color }}>
            <ExternalLink size={12} />
            <span style={{ fontSize: 11 }}>{l.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
