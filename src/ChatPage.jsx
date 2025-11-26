import React, { useState, useRef, useEffect } from "react";

const BACKEND_URL = "http://localhost:5000";

// Optional type property to render special cards (summary, system, etc.)
const ChatPage = ({ userEmail, knowledgeBase = [] }) => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      type: "system",
      text: `Hello ${userEmail || "there"} — welcome to SecureDoc AI! 
You can chat with me, upload a PDF, or type "summarize <documentId>" to get an AI summary.`
    }
  ]);
  const [input, setInput] = useState("");
  const fileRef = useRef(null);
  const boxRef = useRef(null);

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
    const userMsg = { role: "user", text: userText };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // 1) Try to answer from knowledge base
    const kbAnswer = findKnowledgeAnswer(userText);
    if (kbAnswer) {
      setMessages((m) => [
        ...m,
        { role: "bot", type: "kb", text: kbAnswer }
      ]);
      return;
    }

    // 2) Check for "summarize <id>" command
    const lower = userText.toLowerCase();
    if (lower.startsWith("summarize")) {
      const parts = userText.split(" ").filter(Boolean);
      const id = parts[1];

      if (!id) {
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text:
              'Please provide a document ID. Example: "summarize 64f123abc123..."'
          }
        ]);
        return;
      }

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
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch summary");
        }

        // Show a nicely formatted summary card
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            type: "summary",
            docId: id,
            title: `Summary for document ${id}`,
            text: data.summary || "(No summary generated)"
          }
        ]);
      } catch (err) {
        console.error("summarize error:", err);
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: "❌ Failed to summarize that document: " + err.message
          }
        ]);
      }
      return;
    }

    // 3) Fallback response if no KB and no command matched
    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text:
          "I didn't find that in my knowledge base.\n" +
          'You can ask about how the app works, upload a PDF, or type commands like:\n' +
          '- "summarize <documentId>" to generate a summary of an uploaded PDF.'
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

    // Show file message
    setMessages((m) => [
      ...m,
      { role: "user", text: `📄 File : ${file.name}...` }
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

      // 1) Confirmation bubble
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `✅ Uploaded "${file.name}" successfully${
            uploadedDoc ? ` (ID: ${uploadedDoc._id})` : ""
          }`
        }
      ]);

      // 2) If summary is already stored, show as separate summary card
      if (uploadedDoc && uploadedDoc.summary) {
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            type: "summary",
            docId: uploadedDoc._id,
            title: `AI summary for "${uploadedDoc.fileName || file.name}"`,
            text: uploadedDoc.summary
          }
        ]);
      } else if (uploadedDoc) {
        // If no summary yet, guide user how to get it
        setMessages((m) => [
          ...m,
          {
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
        { role: "bot", text: "❌ Upload failed: " + err.message }
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
  const renderMessage = (m, i) => {
    const isUser = m.role === "user";
    const isSummary = m.type === "summary";

    // Outer row: left for bot, right for user
    const rowClass = `chat-row ${isUser ? "chat-row-user" : "chat-row-bot"}`;

    if (isSummary) {
      // Special card for summaries
      return (
        <div key={i} className={rowClass}>
          <div className="msg msg-summary">
            {m.title && <div className="msg-summary-title">{m.title}</div>}
            <div className="msg-summary-body">
              {/* preserve new lines from summary */}
              <pre className="msg-summary-text">{m.text}</pre>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={i} className={rowClass}>
        <div className={`msg ${isUser ? "user-msg" : "bot-msg"}`}>
          {/* preserve new lines for all normal messages too */}
          <span style={{ whiteSpace: "pre-line" }}>{m.text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-page-outer">
      {/* Chat Card Wrapper */}
      <div className="chat-card">
        {/* Header */}
        <div className="chat-header">
          <div>
            <h2 className="chat-title">SecureDoc AI Assistant</h2>
            <p className="chat-subtitle">
              Upload documents, get summaries, and ask how the app works.
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
          {/* Upload Button */}
          <button className="upload-icon" onClick={openFilePicker} title="Upload document">
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
            placeholder='Ask SecureDoc AI, e.g. "how do i upload a file" or "summarize <documentId>"...'
            className="chat-input"
          />

          <button className="chatgpt-send" onClick={send} title="Send">
            <div className="send-arrow-up" />
          </button>
        </div>
      </div>

      {/* Quick helpful hint under the card */}
      <div className="chat-hint">
        💡 Tip: After uploading, note the <b>Document ID</b> and type{" "}
        <code>summarize &lt;id&gt;</code> to generate a summary again.
      </div>
    </div>
  );
};

export default ChatPage;
