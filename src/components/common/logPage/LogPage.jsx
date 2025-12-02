// frontend/src/LogsPage.jsx
import React, { useEffect, useState } from "react";

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return;
  const header = Object.keys(rows[0]);
  const csv = [
    header.join(","),
    ...rows.map(r => header.map(h => {
      const v = r[h] ?? "";
      // escape quotes
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchLogs = async (opts = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", opts.page ?? page);
      params.append("limit", limit);
      if (opts.q !== undefined ? opts.q : q) params.append("q", opts.q !== undefined ? opts.q : q);
      if (opts.action !== undefined ? opts.action : action) params.append("action", opts.action !== undefined ? opts.action : action);
      if (opts.from !== undefined ? opts.from : from) params.append("from", opts.from !== undefined ? opts.from : from);
      if (opts.to !== undefined ? opts.to : to) params.append("to", opts.to !== undefined ? opts.to : to);

      const res = await fetch(`${BACKEND_URL}/api/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load logs");
      setLogs(data.logs || []);
      setPage(data.meta.page || 1);
      setPages(data.meta.pages || 1);
      setTotal(data.meta.total || 0);
    } catch (err) {
      console.error("fetchLogs error:", err);
      alert("Failed to load logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const onSearch = () => fetchLogs({ page: 1, q, action, from, to });
  const onClear = () => { setQ(""); setAction(""); setFrom(""); setTo(""); fetchLogs({ page: 1, q: "", action: "", from: "", to: "" }); };

  const onExport = () => {
    // Flatten rows for CSV
    const rows = logs.map(l => ({
      date: formatDate(l.createdAt || l.createdAt),
      action: l.action,
      fileName: l.fileName || "",
      details: l.details || l.extra || "",
      userEmail: l.userEmail || ""
    }));
    downloadCSV(`securedoc-logs-${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        <div>
          <button
            onClick={onExport}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search file name, action or details..."
            className="border rounded-md px-3 py-2"
          />
          <select value={action} onChange={e => setAction(e.target.value)} className="border rounded-md px-3 py-2">
            <option value="">All actions</option>
            <option value="upload">Upload</option>
            <option value="download">Download</option>
            <option value="public-download">Public Download</option>
            <option value="email">Email</option>
          </select>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded-md px-3 py-2" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded-md px-3 py-2" />
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={onSearch} className="bg-green-600 text-white px-3 py-1 rounded-md">Search</button>
          <button onClick={onClear} className="bg-gray-200 px-3 py-1 rounded-md">Clear</button>
          <div className="ml-auto text-sm text-gray-600 self-center">Total: {total}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">File</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">No logs found</td></tr>
            ) : logs.map((l) => (
              <tr key={l._id}>
                <td className="px-4 py-3 text-sm">{formatDate(l.createdAt)}</td>
                <td className="px-4 py-3 text-sm font-medium">{l.action}</td>
                <td className="px-4 py-3 text-sm">{l.fileName || "-"}</td>
                <td className="px-4 py-3 text-sm break-words max-w-xl">{l.details || l.extra || "-"}</td>
                <td className="px-4 py-3 text-sm">{l.userEmail || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">Page {page} of {pages}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (page > 1) { fetchLogs({ page: page - 1 }); setPage(page - 1); } }}
              disabled={page <= 1}
              className="px-3 py-1 rounded-md border bg-white"
            >Prev</button>

            <button
              onClick={() => { if (page < pages) { fetchLogs({ page: page + 1 }); setPage(page + 1); } }}
              disabled={page >= pages}
              className="px-3 py-1 rounded-md border bg-white"
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
