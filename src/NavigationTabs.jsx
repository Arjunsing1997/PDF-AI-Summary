import React from "react";

export default function NavigationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="tabs-container">
      <button className={activeTab === "chat" ? "tab active" : "tab"} onClick={() => setActiveTab("chat")}>💬 AI Chat</button>
      <button className={activeTab === "documents" ? "tab active" : "tab"} onClick={() => setActiveTab("documents")}>📄 Documents</button>
      
      <button className={activeTab === "retrieve" ? "tab active" : "tab"} onClick={() => setActiveTab("retrieve")}>⬇ Retrieve</button>
    </div>
  );
}
