import React, { useRef, useState } from "react";

export default function UploadPage({ userEmail }) {
  const fileRef = useRef();
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

  // UPLOAD TO BACKEND
  const uploadToBackend = async (file) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file); // MUST MATCH BACKEND
      formData.append("uploadPassword", passwordForUpload);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/pdf/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed: " + err.message);
    }
  };

  const onFilesChosen = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const f of files) {
      const uploaded = await uploadToBackend(f);

      if (uploaded?.document) {
        const preview = {
          id: Date.now() + Math.random(),
          name: uploaded.document.fileName,
          url: uploaded.document.path,
          type: f.type,
        };
        setPendingFiles((prev) => [preview, ...prev]);
      }
    }

    setPasswordForUpload("");
    setUploading(false);
  };

  const removePending = (id) => {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="documents-page">
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

      {pendingFiles.length > 0 && (
        <div>
          <h3>Recently Uploaded</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            {pendingFiles.map((f) => (
              <div
                key={f.id}
                style={{
                  width: 150,
                  borderRadius: 12,
                  padding: 8,
                  background: "#fff",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                  position: "relative",
                }}
              >
                {f.type.startsWith("image/") ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    style={{
                      width: "100%",
                      height: 90,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 90,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                    }}
                  >
                    PDF
                  </div>
                )}

                <div
                  style={{
                    fontSize: 13,
                    marginTop: 8,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {f.name}
                </div>

                <button
                  onClick={() => removePending(f.id)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.06)",
                    border: "none",
                    borderRadius: 8,
                    padding: 6,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <button className="modal-cancel" onClick={() => setShowPassword(false)}>
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
