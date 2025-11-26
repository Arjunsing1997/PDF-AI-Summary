import React, { useEffect, useState } from "react";

export default function RetrievePage() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [otp, setOtp] = useState("");

  // --------------------------------------------------------
  //  LOAD FILES FROM BACKEND  →  /api/pdf/list
  // --------------------------------------------------------
  useEffect(() => {
    fetch("http://localhost:5000/api/pdf/list", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("RETRIEVE FILES:", data);

        if (data.documents) {
          setDocs(data.documents);
          setFiltered(data.documents);
        }
      })
      .catch((err) => console.error("Error fetching documents:", err));
  }, []);

  // --------------------------------------------------------
  //  SEARCH DOCUMENTS BY NAME
  // --------------------------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setFiltered(docs);
      return;
    }

    const q = query.toLowerCase();
    const results = docs.filter((d) =>
      d.fileName.toLowerCase().includes(q)
    );

    setFiltered(results);
  };

  // --------------------------------------------------------
  //  OPEN PASSWORD POPUP
  // --------------------------------------------------------
  const attemptDownload = (doc) => {
    setSelectedDoc(doc);
    setOtp("");
    setShowPassword(true);
  };

  // --------------------------------------------------------
  //  VERIFY OTP + DOWNLOAD
  // --------------------------------------------------------
  const confirmDownload = () => {
    if (!otp.trim()) {
      alert("Enter OTP before downloading");
      return;
    }

    setShowPassword(false);

    if (!selectedDoc) return;

    // S3 URL → open directly
    if (selectedDoc.path.includes("s3.amazonaws.com")) {
      window.open(selectedDoc.path, "_blank");
    } else {
      // Local file
      window.location.href = `http://localhost:5000/api/files/download/${selectedDoc._id}`;
    }
  };

  return (
    <div className="retrieve-page">
      <h3>Retrieve Documents</h3>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
        <input
          className="search-box"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
        />
        <button className="retrieve-btn">Search</button>
      </form>

      {/* File List */}
      <div style={{ marginTop: 20 }}>
        {filtered.length === 0 ? (
          <div>No documents found</div>
        ) : (
          filtered.map((doc) => (
            <div key={doc._id} className="result-card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{doc.fileName}</strong>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    Uploaded: {new Date(doc.createdAt).toLocaleString()}
                  </div>
                </div>

                <button
                  className="retrieve-btn"
                  onClick={() => attemptDownload(doc)}
                >
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* OTP POPUP */}
      {showPassword && (
        <div className="password-modal">
          <div className="password-box">
            <h3>Enter OTP to Download</h3>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowPassword(false)}
              >
                Cancel
              </button>
              <button className="modal-confirm" onClick={confirmDownload}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
