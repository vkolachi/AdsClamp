"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Campaigns from "@/components/Campaigns";
import CreateCampaign from "@/components/CreateCampaign";
import { AD_ACCOUNTS } from "@/lib/fbClient";

export type Page = "dashboard" | "campaigns" | "create";

export default function Home() {
  const [page, setPage] = useState<Page>("dashboard");
  const [accountId, setAccountId] = useState(AD_ACCOUNTS[0].id);

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} accountId={accountId} setAccountId={setAccountId} />
      <div className="main">
        {page === "dashboard" && <Dashboard accountId={accountId} setPage={setPage} />}
        {page === "campaigns" && <Campaigns accountId={accountId} setPage={setPage} />}
        {page === "create" && <CreateCampaign accountId={accountId} setPage={setPage} />}
      </div>
    </div>
  );
}
