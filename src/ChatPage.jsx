import React, { useState, useRef, useEffect } from "react";

const BACKEND_URL = "http://localhost:5000";

const ChatPage = ({ userEmail, knowledgeBase = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      type: "system",
      text: `Hello ${userEmail || "there"} — welcome to SecureDoc AI! 
You can chat with me, upload a PDF, or type commands like:
- "list"
- "find my report"
- "summarize <documentId>"
- "email <documentId>"`
    }
  ]);
  const [input, setInput] = useState("");
  const fileRef = useRef(null);
  const boxRef = useRef(null);

  // helper to make simple ids for messages
  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  // ---------------------------------
  // Helper: find answer in knowledgeBase
  // ---------------------------------
  const findKnowledgeAnswer = (text) => {
    const q = text.toLowerCase().trim();
    if (!q) return null;

    const found = knowledgeBase.find((k) =>
      q.includes(k.question.toLowerCase())
    );

    return found ? found.answer : null;
  };

  // ---------------------------------
  // SEND TEXT MESSAGE
  // ---------------------------------
  const send = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg = { id: makeId(), role: "user", text: userText };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // 1) Try KB
    const kbAnswer = findKnowledgeAnswer(userText);
    if (kbAnswer) {
      setMessages((m) => [
        ...m,
        { id: makeId(), role: "bot", type: "kb", text: kbAnswer }
      ]);
      return;
    }

    const lower = userText.toLowerCase();

    // 2) summarize <id> (with loader)
    if (lower.startsWith("summarize")) {
      const parts = userText.split(" ").filter(Boolean);
      const id = parts[1];

      if (!id) {
        setMessages((m) => [
          ...m,
          {
            id: makeId(),
            role: "bot",
            text:
              'Please provide a document ID. Example: "summarize 64f123abc123..."'
          }
        ]);
        return;
      }

      const loadingId = makeId();
      // show loader bubble
      setMessages((m) => [
        ...m,
        {
          id: loadingId,
          role: "bot",
          type: "loading",
          text: `Generating summary for document ${id}...`
        }
      ]);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/api/pdf/${id}/summary`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch summary");

        const summaryText = data.summary || "(No summary generated)";

        // replace loading message with summary card
        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? {
                  id: loadingId,
                  role: "bot",
                  type: "summary",
                  docId: id,
                  title: `Summary for document ${id}`,
                  text: summaryText
                }
              : msg
          )
        );
      } catch (err) {
        console.error("summarize error:", err);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  type: "bot",
                  text:
                    "❌ Failed to summarize that document: " + err.message
                }
              : msg
          )
        );
      }
      return;
    }

    // 3) email <id>
    if (lower.startsWith("email")) {
      const parts = userText.split(" ").filter(Boolean);
      const id = parts[1];

      if (!id) {
        setMessages((m) => [
          ...m,
          {
            id: makeId(),
            role: "bot",
            text:
              'Please provide a document ID. Example: "email 64f123abc123..."'
          }
        ]);
        return;
      }

      const loadingId = makeId();
      setMessages((m) => [
        ...m,
        {
          id: loadingId,
          role: "bot",
          type: "loading",
          text: `Sending document ${id} to your email...`
        }
      ]);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/api/pdf/${id}/email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to send email");

        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  type: "bot",
                  text: `📧 Email sent for document ${id} to your registered email.`
                }
              : msg
          )
        );
      } catch (err) {
        console.error("email error:", err);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  type: "bot",
                  text:
                    "❌ Failed to email that document: " + err.message
                }
              : msg
          )
        );
      }
      return;
    }

    // 4) list documents
    if (lower === "list" || lower.startsWith("list ")) {
      const loadingId = makeId();
      setMessages((m) => [
        ...m,
        {
          id: loadingId,
          role: "bot",
          type: "loading",
          text: "Fetching your documents..."
        }
      ]);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/api/pdf`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to list documents");

        const docs = data.documents || [];
        let text;
        if (!docs.length) {
          text = "You don't have any uploaded documents yet.";
        } else {
          const lines = docs.map(
            (d, index) =>
              `${index + 1}. ${d.fileName} (ID: ${d._id})`
          );
          text = "Here are your documents:\n" + lines.join("\n");
        }

        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? { ...msg, type: "bot", text }
              : msg
          )
        );
      } catch (err) {
        console.error("list error:", err);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  type: "bot",
                  text:
                    "❌ Failed to list your documents: " + err.message
                }
              : msg
          )
        );
      }
      return;
    }

    // 5) find <term> (simple search)
    if (lower.startsWith("find")) {
      const term = userText.replace(/find/i, "").trim();
      if (!term) {
        setMessages((m) => [
          ...m,
          {
            id: makeId(),
            role: "bot",
            text:
              'Please provide a search term. Example: "find project report"'
          }
        ]);
        return;
      }

      const loadingId = makeId();
      setMessages((m) => [
        ...m,
        {
          id: loadingId,
          role: "bot",
          type: "loading",
          text: `Searching for documents matching "${term}"...`
        }
      ]);

      try {
        const token = localStorage.getItem("token");
        const url = `${BACKEND_URL}/api/pdf?q=${encodeURIComponent(term)}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to search");

        const docs = data.documents || [];
        let text;
        if (!docs.length) {
          text = `No documents found matching "${term}".`;
        } else {
          const lines = docs.map(
            (d, index) =>
              `${index + 1}. ${d.fileName} (ID: ${d._id})`
          );
          text = `Search results for "${term}":\n` + lines.join("\n");
        }

        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? { ...msg, type: "bot", text }
              : msg
          )
        );
      } catch (err) {
        console.error("find error:", err);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  type: "bot",
                  text: "❌ Search failed: " + err.message
                }
              : msg
          )
        );
      }
      return;
    }

    // 6) Fallback
    setMessages((m) => [
      ...m,
      {
        id: makeId(),
        role: "bot",
        text:
          "I didn't find that in my knowledge base.\n" +
          "You can:\n" +
          '- Ask "how do i upload a file"\n' +
          '- Type "list" to see your documents\n' +
          '- Type "find <term>" to search\n' +
          '- Type "summarize <documentId>"\n' +
          '- Type "email <documentId>"'
      }
    ]);
  };

  // ---------------------------------
  // SEND FILE (PDF/Images)
  // ---------------------------------
  const onFileChosen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // reset file input so same file can be chosen again
    e.target.value = null;

    setMessages((m) => [
      ...m,
      { id: makeId(), role: "user", text: `📄 Uploading: ${file.name}...` }
    ]);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("pdf", file); // backend expects `pdf`

      const res = await fetch(`${BACKEND_URL}/api/pdf/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      const uploadedDoc =
        data.results && data.results[0] && data.results[0].doc;

      const confirmMsg = {
        id: makeId(),
        role: "bot",
        text: `✅ Uploaded "${file.name}" successfully${
          uploadedDoc ? ` (ID: ${uploadedDoc._id})` : ""
        }`
      };

      setMessages((m) => [...m, confirmMsg]);

      if (uploadedDoc && uploadedDoc.summary) {
        // show summary card for newly uploaded doc
        setMessages((m) => [
          ...m,
          {
            id: makeId(),
            role: "bot",
            type: "summary",
            docId: uploadedDoc._id,
            title: `AI summary for "${uploadedDoc.fileName || file.name}"`,
            text: uploadedDoc.summary
          }
        ]);
      } else if (uploadedDoc) {
        setMessages((m) => [
          ...m,
          {
            id: makeId(),
            role: "bot",
            text:
              `You can generate a summary anytime by typing:\n` +
              `"summarize ${uploadedDoc._id}"`
          }
        ]);
      }
    } catch (err) {
      console.error("upload error:", err);
      setMessages((m) => [
        ...m,
        {
          id: makeId(),
          role: "bot",
          text: "❌ Upload failed: " + err.message
        }
      ]);
    }
  };

  const openFilePicker = () => fileRef.current?.click();

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault?.();
      send();
    }
  };

  // ---------------------------------
  // RENDER MESSAGE BUBBLES
  // ---------------------------------
  const renderMessage = (m) => {
    const isUser = m.role === "user";
    const isSummary = m.type === "summary";
    const isLoading = m.type === "loading";

    const rowClass = `chat-row ${isUser ? "chat-row-user" : "chat-row-bot"}`;

    if (isSummary) {
      return (
        <div key={m.id} className={rowClass}>
          <div className="msg msg-summary">
            {m.title && <div className="msg-summary-title">{m.title}</div>}
            <div className="msg-summary-body">
              <pre className="msg-summary-text">{m.text}</pre>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div key={m.id} className={rowClass}>
          <div className="msg bot-msg loading-msg">
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
            <span style={{ marginLeft: 6 }}>{m.text}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={m.id} className={rowClass}>
        <div className={`msg ${isUser ? "user-msg" : "bot-msg"}`}>
          <span style={{ whiteSpace: "pre-line" }}>{m.text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-page-outer">
      <div className="chat-card">
        {/* Header */}
        <div className="chat-header">
          <div>
            <h2 className="chat-title">SecureDoc AI Assistant</h2>
            <p className="chat-subtitle">
              Upload documents, search, summarize, and email with AI.
            </p>
          </div>
          <div className="chat-user">
            <span className="chat-user-avatar">
              {userEmail ? userEmail[0]?.toUpperCase() : "U"}
            </span>
            <span className="chat-user-email">
              {userEmail || "Guest user"}
            </span>
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window" ref={boxRef}>
          {messages.map(renderMessage)}
        </div>

        {/* Input Bar */}
        <div className="input-area">
          <button
            className="upload-icon"
            onClick={openFilePicker}
            title="Upload document"
          >
            📎
          </button>

          <input
            ref={fileRef}
            type="file"
            className="hidden-input"
            accept="application/pdf,image/*"
            onChange={onFileChosen}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder='Ask SecureDoc AI, e.g. "list", "find report", "summarize <id>"...'
            className="chat-input"
          />

          <button className="chatgpt-send" onClick={send} title="Send">
            <div className="send-arrow-up" />
          </button>
        </div>
      </div>

      <div className="chat-hint">
        💡 Tip: After uploading, note the <b>Document ID</b> and type{" "}
        <code>summarize &lt;id&gt;</code> or <code>email &lt;id&gt;</code>.
      </div>
    </div>
  );
};

export default ChatPage;
