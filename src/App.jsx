import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import knowledgeBase from "./knowledgeBase";

export default function App() {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (email) => {
    setUserEmail(email || "user@example.com");
    navigate("/dashboard");
  };

  const handleRegister = (email) => {
    setUserEmail(email || "newuser@example.com");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUserEmail(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register onRegister={handleRegister} />} />
      <Route
        path="/dashboard"
        element={<Dashboard userEmail={userEmail} onLogout={handleLogout} knowledgeBase={knowledgeBase} />}
      />
    </Routes>
  );
}
