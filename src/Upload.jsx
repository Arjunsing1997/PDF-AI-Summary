import React, { useRef, useState } from "react";

const BACKEND_URL = "http://localhost:5000";

export default function UploadPage({ userEmail }) {
  const fileRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [passwordForUpload, setPasswordForUpload] = useState("");
  const [uploading, setUploading] = useState(false);

  const onUploadClick = () => setShowPassword(true);

  const handlePasswordConfirm = () => {
    if (!passwordForUpload.trim()) {
      alert("Please enter a password!");
      return;
    }
    setShowPassword(false);
    fileRef.current?.click();
  };

  // -----------------------------
  // UPLOAD SINGLE FILE TO BACKEND
  // -----------------------------
  const uploadToBackend = async (file) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file); // MUST MATCH BACKEND FIELD NAME
      formData.append("uploadPassword", passwordForUpload); // used for AES encryption

      const token = localStorage.getItem("token");

      const res = await fetch(`${BACKEND_URL}/api/pdf/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // backend: { message: 'Files uploaded', results: [ { doc, file } ] }
      const uploadedDoc =
        data.results && data.results[0] && data.results[0].doc;

      return uploadedDoc || null;
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed: " + err.message);
      return null;
    }
  };

  // -----------------------------
  // HANDLE FILES SELECTED
  // -----------------------------
  const onFilesChosen = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const f of files) {
      const uploadedDoc = await uploadToBackend(f);

      if (uploadedDoc) {
        const preview = {
          id: uploadedDoc._id || Date.now() + Math.random(),
          name: uploadedDoc.fileName || f.name,
          url: uploadedDoc.path || "",
          type: f.type,
          summary: uploadedDoc.summary || "",
          encrypted: uploadedDoc.encrypted,
        };
        setPendingFiles((prev) => [preview, ...prev]);
      }
    }

    // reset
    setPasswordForUpload("");
    setUploading(false);
    e.target.value = null;
  };

  const removePending = (id) => {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="documents-page">
      {/* Header */}
      <div className="upload-header">
        <div>
          <h2 className="upload-title">Secure Upload</h2>
          <p className="upload-subtitle">
            Upload PDFs and images. Files are secured with your password and stored in the cloud.
          </p>
        </div>
        <div className="upload-user-pill">
          <span className="upload-user-avatar">
            {userEmail ? userEmail[0]?.toUpperCase() : "U"}
          </span>
          <span className="upload-user-email">{userEmail || "Guest user"}</span>
        </div>
      </div>

      {/* Upload Box */}
      <div className="upload-box-wrapper">
        <button
          className="upload-btn-original"
          onClick={onUploadClick}
          disabled={uploading}
        >
          <div className="upload-arrow-icon">⬆</div>
          <div>{uploading ? "Uploading..." : "Upload images & documents"}</div>
          <div style={{ fontSize: 12, opacity: 0.92 }}>
            Click to securely upload (Password Required)
          </div>
        </button>

        <input
          ref={fileRef}
          className="hidden-input"
          type="file"
          onChange={onFilesChosen}
          multiple
          accept="image/*,application/pdf"
        />
      </div>

      {/* Recently Uploaded */}
      {pendingFiles.length > 0 && (
        <div className="recent-uploads">
          <h3>Recently Uploaded</h3>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 8,
            }}
          >
            {pendingFiles.map((f) => (
              <div
                key={f.id}
                style={{
                  width: 190,
                  borderRadius: 12,
                  padding: 8,
                  background: "#fff",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {f.type?.startsWith("image/") ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      borderRadius: 8,
                      background: "#f3f4f6",
                      fontSize: 28,
                      fontWeight: 600,
                    }}
                  >
                    PDF
                  </div>
                )}

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {f.name}
                </div>

                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  {f.encrypted ? "🔐 Encrypted" : "⚠ Not encrypted"}
                </div>

                {f.summary && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#4b5563",
                      background: "#f9fafb",
                      borderRadius: 8,
                      padding: 6,
                      maxHeight: 60,
                      overflow: "hidden",
                    }}
                  >
                    <strong>AI summary:</strong>{" "}
                    <span>{f.summary.slice(0, 100)}...</span>
                  </div>
                )}

                <button
                  onClick={() => removePending(f.id)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.06)",
                    border: "none",
                    borderRadius: 8,
                    padding: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPassword && (
        <div className="password-modal">
          <div className="password-box">
            <h3>Enter password to secure upload</h3>
            <input
              type="password"
              value={passwordForUpload}
              onChange={(e) => setPasswordForUpload(e.target.value)}
              placeholder="Enter upload password"
            />
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowPassword(false)}
              >
                Cancel
              </button>
              <button className="modal-confirm" onClick={handlePasswordConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
