import React, { useEffect, useState } from "react";
import  EmailPasswordModal  from '../src/components/common/EmailPasswordModal'

const BACKEND_URL = "http://localhost:5000";

export default function RetrievePage({ userEmail }) {

  const [downloadDoc, setDownloadDoc] = useState(null);         // doc selected for download
  const [downloadPassword, setDownloadPassword] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);


  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [summaryLoadingId, setSummaryLoadingId] = useState(null);
  const [summaryDoc, setSummaryDoc] = useState(null); // { id, name, summary }

  const [emailSendingId, setEmailSendingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);


  const openModal = (doc) => {
    setSelectedDoc(doc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDoc(null);
  };

  const token = localStorage.getItem("token");

  // -----------------------------
  // FETCH DOCUMENTS (OPTIONALLY WITH SEARCH)
  // -----------------------------
  const fetchDocuments = async (query = "") => {
    try {
      setLoadingDocs(true);
      let url = `${BACKEND_URL}/api/pdf/list`;
      if (query.trim()) {
        url += `?q=${encodeURIComponent(query.trim())}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("Log List ", data.documents)
      if (!res.ok) throw new Error(data.message || "Failed to fetch documents");

      setDocuments(data.documents || []);
    } catch (err) {
      console.error("fetchDocuments error:", err);
      alert("Failed to retrieve documents: " + err.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchDocuments("");
  };

  // -----------------------------
  // DOWNLOAD (simple: open S3/local URL)
  // -----------------------------
  // const handleDownload = (doc) => {
  //   if (!doc.path) {
  //     alert("No file path available for this document.");
  //     return;
  //   }
  //   // For a more secure flow, you would call a /download endpoint,
  //   // but for now this opens the stored URL or local path.
  //   window.open(doc.path, "_blank");
  // };

  const handleDownload = (doc) => {
  // If not encrypted, you *could* still go through backend, but for now:
  if (!doc.encrypted) {
    // Option A: direct open (simpler)
    if (!doc.path) {
      alert("No file path available for this document.");
      return;
    }
    window.open(doc.path, "_blank");
    return;

    // Option B (more secure): always go via backend without password
    // setDownloadDoc(doc); // and handle it in the same modal with optional password
  }

  // For encrypted docs: open password modal
  setDownloadDoc(doc);
  setDownloadPassword("");
};


const confirmDownload = async () => {
  if (!downloadDoc) return;

  try {
    setDownloadLoading(true);

    const res = await fetch(
      `${BACKEND_URL}/api/pdf/${downloadDoc._id}/download`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: downloadPassword,
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Download failed");
    }

    // Get PDF blob from response
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = downloadDoc.fileName || "document.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    // Close modal
    setDownloadDoc(null);
    setDownloadPassword("");
  } catch (err) {
    console.error("confirmDownload error:", err);
    alert("Failed to download: " + err.message);
  } finally {
    setDownloadLoading(false);
  }
};


  // -----------------------------
  // SUMMARIZE DOC (SHOW PANEL)
  // -----------------------------
  const handleSummarize = async (doc) => {
    try {
      setSummaryLoadingId(doc._id);
      setSummaryDoc(null);

      const res = await fetch(
        `${BACKEND_URL}/api/pdf/${doc._id}/summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to get summary");
      }

      setSummaryDoc({
        id: doc._id,
        name: doc.fileName,
        summary: data.summary || "(No summary generated)",
      });
    } catch (err) {
      console.error("handleSummarize error:", err);
      alert("Failed to summarize: " + err.message);
    } finally {
      setSummaryLoadingId(null);
    }
  };

  // -----------------------------
  // EMAIL DOC
  // -----------------------------
// const handleEmail = async (doc) => {
//   try {
//     setEmailSendingId(doc._id);
//     const res = await fetch(
//       `${BACKEND_URL}/api/pdf/${doc._id}/email`,
//       // `${BACKEND_URL}/api/test-email`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) {
//       throw new Error(data.message || "Failed to send email");
//     }

//     alert(
//       `Email sent for "${doc.fileName}" to your registered email address.`
//     );
//   } catch (err) {
//     console.error("handleEmail error:", err);
//     alert("Failed to email document: " + err.message);
//   } finally {
//     setEmailSendingId(null);
//   }
// };

const sendEmail = async (password) => {
    if (!selectedDoc) return;
    setEmailSendingId(selectedDoc._id);
    try {
      const token = localStorage.getItem("token"); // your auth token
      const res = await fetch(`${BACKEND_URL}/api/pdf/${selectedDoc._id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      alert("Email sent successfully!");
      closeModal();
    } catch (err) {
      alert("Send failed: " + err.message);
      console.error(err);
    } finally {
      setEmailSendingId(null);
    }
  };


  return (

    
    <div className="documents-page">

      {/* Download password modal */}
{downloadDoc && (
  <div className="password-modal">
    <div className="password-box">
      <h3>Enter password to download</h3>
      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        Document: <strong>{downloadDoc.fileName}</strong>
      </p>
      <input
        type="password"
        value={downloadPassword}
        onChange={(e) => setDownloadPassword(e.target.value)}
        placeholder="Enter the same password used during upload"
      />
      <div className="modal-actions">
        <button
          className="modal-cancel"
          onClick={() => {
            setDownloadDoc(null);
            setDownloadPassword("");
          }}
          disabled={downloadLoading}
        >
          Cancel
        </button>
        <button
          className="modal-confirm"
          onClick={confirmDownload}
          disabled={downloadLoading || !downloadPassword.trim()}
        >
          {downloadLoading ? "Decrypting..." : "Download"}
        </button>
      </div>
    </div>
  </div>
)}




      {/* Header */}
      <div className="upload-header">
        <div>
          <h2 className="upload-title">My Documents</h2>
          <p className="upload-subtitle">
            View, search, download, summarize, and email your uploaded documents.
          </p>
        </div>
        <div className="upload-user-pill">
          <span className="upload-user-avatar">
            {userEmail ? userEmail[0]?.toUpperCase() : "U"}
          </span>
          <span className="upload-user-email">{userEmail || "Guest user"}</span>
        </div>
      </div>

      {/* Search bar */}
      <form className="docs-search-bar" onSubmit={onSearchSubmit}>
        <input
          type="text"
          placeholder="Search by file name or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="docs-search-input"
        />
        <button type="submit" className="docs-search-button">
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            className="docs-clear-button"
            onClick={clearSearch}
          >
            Clear
          </button>
        )}
      </form>

      {/* Documents list */}
      <div className="docs-list-card">
        {loadingDocs ? (
          <div className="docs-loading">Loading your documents...</div>
        ) : documents.length === 0 ? (
          <div className="docs-empty">
            No documents found. Try uploading some files first.
          </div>
        ) : (
          <table className="docs-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Encrypted</th>
                <th>Uploaded At</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.fileName}</td>
                  <td>{doc.size || "-"}</td>
                  <td>{doc.encrypted ? "🔐 Yes" : "⚠ No"}</td>
                  <td>
                    {doc.uploadDate
                      ? new Date(doc.uploadDate).toLocaleString()
                      : "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="docs-action-btn"
                      onClick={() => handleDownload(doc)}
                    >
                      ⬇ Download
                    </button>
                    <button
                      className="docs-action-btn"
                      onClick={() => handleSummarize(doc)}
                      disabled={summaryLoadingId === doc._id}
                    >
                      {summaryLoadingId === doc._id
                        ? "Summarizing..."
                        : "🧠 Summary"}
                    </button>
                    <button
                      className="docs-action-btn"
                      onClick={() => openModal(doc)}
                      disabled={emailSendingId === doc._id}
                    >
                      {emailSendingId === doc._id
                        ? "Emailing..."
                        : "📧 Email"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary panel */}
      {summaryDoc && (
        <div className="docs-summary-panel">
          <div className="docs-summary-header">
            <h3>AI Summary</h3>
            <button
              className="docs-summary-close"
              onClick={() => setSummaryDoc(null)}
            >
              ✕
            </button>
          </div>
          <div className="docs-summary-meta">
            <strong>Document:</strong> {summaryDoc.name}
          </div>
          <pre className="docs-summary-text">{summaryDoc.summary}</pre>
        </div>
      )}

      <EmailPasswordModal
        open={modalOpen}
        onClose={closeModal}
        onConfirm={sendEmail}
        fileName={selectedDoc?.fileName}
      />
    </div>
  );
}
