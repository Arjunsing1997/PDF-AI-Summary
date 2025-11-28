// frontend/src/components/EmailPasswordModal.jsx
import React, { useState } from "react";

export default function EmailPasswordModal({ open, onClose, onConfirm, fileName }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(password);
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.45)", zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{ width: 360, padding: 20, borderRadius: 12, background: "#fff" }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Email & attach "{fileName}"</h3>
        <p style={{ marginTop: 0, color: "#666" }}>Enter the upload password to decrypt and send the file.</p>
        <input
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Upload password"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 12 }}
          required
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 8 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#4f46e5", color: "#fff" }}>
            {loading ? "Sending..." : "Send email"}
          </button>
        </div>
      </form>
    </div>
  );
}
