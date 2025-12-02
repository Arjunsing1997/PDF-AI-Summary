// NavigationTabs.jsx (or wherever your component is)
import React from "react";

export default function NavigationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="nav-tabs" style={{ display: "flex", gap: 12, margin: "12px 0" }}>
      <button
        className={activeTab === "chat" ? "tab active" : "tab"}
        onClick={() => setActiveTab("chat")}
      >
        Chat
      </button>

      <button
        className={activeTab === "documents" ? "tab active" : "tab"}
        onClick={() => setActiveTab("documents")}
      >
        Upload
      </button>

      <button
        className={activeTab === "retrieve" ? "tab active" : "tab"}
        onClick={() => setActiveTab("retrieve")}
      >
        Retrieve
      </button>

      <button
        className={activeTab === "logs" ? "tab active" : "tab"}
        onClick={() => setActiveTab("logs")}
      >
        Activity Logs
      </button>
    </div>
  );
}
