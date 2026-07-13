"use client";
import { LayoutDashboard, Megaphone, PlusCircle, ExternalLink } from "lucide-react";
import { AD_ACCOUNTS, getAccountById } from "@/lib/fbClient";
import type { Page } from "@/app/page";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  accountId: string;
  setAccountId: (id: string) => void;
}

const NAV = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "create", label: "Create Ad", icon: PlusCircle },
] as const;

export default function Sidebar({ page, setPage, accountId, setAccountId }: Props) {
  const account = getAccountById(accountId);
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-icon">C</div>
          <div>
            <div className="logo-text">ClampAds</div>
            <div className="logo-sub">Meta Ads Manager</div>
          </div>
        </div>
      </div>

      {/* Account switcher */}
      <div style={{ padding: "10px 8px" }}>
        <div className="account-switcher">
          <div className="account-switcher-label">Active Brand</div>
          <select className="account-select" value={accountId} onChange={e => setAccountId(e.target.value)}>
            {AD_ACCOUNTS.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: account.color }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{account.url}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id as Page)}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="sidebar-section" style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <div className="sidebar-label">Quick Links</div>
        {[
          { label: "DealClamp Site", url: "https://dealclamp.com", color: "#4f6ef7" },
          { label: "LootClamp Site", url: "https://lootclamp.com", color: "#a855f7" },
          { label: "Meta Ads Manager", url: "https://business.facebook.com/adsmanager", color: "#1877f2" },
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
