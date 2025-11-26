import React, { useState, useEffect } from "react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="activity-logs"><p>Loading logs...</p></div>;
  }

  return (
    <div className="activity-logs">
      <h3>Activity Logs</h3>
      {error && <p className="error">{error}</p>}
      {logs.length === 0 ? (
        <p>No activity logs found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>File Name</th>
              <th>User Email</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.fileName || "-"}</td>
                <td>{log.userEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
