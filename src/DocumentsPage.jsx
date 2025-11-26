import React, { useState } from "react";

const DocumentsPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userEmail = localStorage.getItem("loggedInEmail") || 
                   (JSON.parse(localStorage.getItem("user") || "{}")).email;

  // Handle file selection and upload
  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    if (!userEmail) {
      setError("Please log in first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      const token = localStorage.getItem("token");

      for (let file of selected) {
        formData.append("pdf", file);
      }

      const response = await fetch("http://localhost:5000/api/pdf/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload files");
      }

      const data = await response.json();

      // Debug: log full backend response so we can inspect multer/multer-s3 output
      console.log("Upload response:", data);

      // Add uploaded files to list. backend returns the saved doc under `doc.path`
      // multer-s3 may also return details under `file.location` or `file.key`.
      const uploadedFiles = selected.map((file) => ({
        name: file.name,
        // prefer backend doc path (S3 URL), then multer file.location, then createObjectURL
        url: data.doc?.path || data.file?.location || URL.createObjectURL(file),
        type: file.type,
        id: data.doc?._id || (Date.now() + Math.random()),
        rawResponse: data
      }));

      setFiles((prev) => [...prev, ...uploadedFiles]);
      setSuccess(`Successfully uploaded ${selected.length} file(s)!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error uploading files: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="documents-page">

      {/* Upload and Retrieve Buttons */}
      <div className="upload-box-wrapper" style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
        <label className="upload-btn-original" style={{flex: 1}}>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden-input"
            disabled={loading}
          />
          <span className="upload-arrow-icon">⬆</span>
          {loading ? "Uploading..." : "Upload"}
        </label>
        
        <button className="upload-btn-original" style={{flex: 1, cursor: "pointer"}}>
          <span className="upload-arrow-icon">⬇</span>
          Retrieve
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="error-message" style={{color: "red", padding: "10px", marginBottom: "10px"}}>{error}</p>}
      
      {/* Success Message */}
      {success && <p className="success-message" style={{color: "green", padding: "10px", marginBottom: "10px", fontWeight: "bold"}}>{success}</p>}

      {/* File Preview */}
      <div className="file-preview-section">
        {files.length === 0 ? (
          <p className="empty-docs">No documents uploaded yet</p>
        ) : (
          files.map((file, index) => (
            <div className="file-preview-item" key={file.id}>
              {file.type.startsWith("image/") ? (
                <img src={file.url} alt={file.name} className="file-thumb" />
              ) : (
                <div className="file-doc-icon">📄</div>
              )}

              <p className="file-name">{file.name}</p>

              <div className="file-actions">
                <button 
                  className="delete-file-btn" 
                  onClick={() => removeFile(index)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
