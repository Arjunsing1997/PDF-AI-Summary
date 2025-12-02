import React, { useState } from "react";
import NavigationTabs from "./NavigationTabs";
import ChatPage from "./ChatPage";
import UploadPage from "./Upload";
import RetrievePage from "./RetrievePage";
import LogsPage from "./components/common/logPage/LogPage";

const Dashboard = ({ userEmail, onLogout, knowledgeBase }) => {
  const [activeTab, setActiveTab] = useState("chat");

  const renderPage = () => {
  switch (activeTab) {
    case "chat":
      return <ChatPage userEmail={userEmail} knowledgeBase={knowledgeBase} />;
    case "documents":
      return <UploadPage userEmail={userEmail} />;
    case "retrieve":
      return <RetrievePage userEmail={userEmail} />;
    case "logs":
      return <LogsPage userEmail={userEmail} />;
    default:
      return <ChatPage userEmail={userEmail} knowledgeBase={knowledgeBase} />;
  }
};


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="left">
          <div className="logo-icon" />
          <div className="title-block">
            <h2>SecureDoc AI</h2>
            <div className="email">{userEmail || "guest@example.com"} • admin</div>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="white-box">
        {renderPage()}
      </div>
    </div>
  );
};

export default Dashboard;
