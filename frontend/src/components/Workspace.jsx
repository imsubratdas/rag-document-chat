import React, { useState, useRef, useEffect } from "react";
import {
  IconSparkles,
  IconDocument,
  IconPlus,
  IconSend,
  IconTrash,
  IconUpload,
  IconSearch,
  IconLogout,
  IconBot,
  IconUser,
  IconQuote,
  IconMenu,
  IconClose,
  IconAlertCircle,
  IconCheck,
} from "./Icons";

// Helper to format timestamps
function formatTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Simple markdown-like text formatter
function FormattedMessage({ content }) {
  if (!content) return null;

  // Split content by code blocks if present
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="message-text-formatted">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const lang = lines[0].match(/^[a-z0-9_-]+$/i) ? lines.shift() : "";
          const code = lines.join("\n");
          return (
            <div key={idx} className="code-block-container">
              {lang && <div className="code-block-lang">{lang}</div>}
              <pre className="code-block-pre">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Standard text: render paragraphs, lists, bold, inline code
        const paragraphs = part.split(/\n\n+/);
        return (
          <React.Fragment key={idx}>
            {paragraphs.map((p, pIdx) => {
              if (p.trim().startsWith("- ") || p.trim().startsWith("* ")) {
                const listItems = p.trim().split(/\n[-*]\s+/).filter(Boolean);
                return (
                  <ul key={pIdx} className="message-list">
                    {listItems.map((item, lIdx) => (
                      <li key={lIdx}>
                        <InlineMarkdown text={item} />
                      </li>
                    ))}
                  </ul>
                );
              }

              if (p.trim().startsWith("### ")) {
                return (
                  <h4 key={pIdx} className="message-h3">
                    <InlineMarkdown text={p.trim().replace(/^###\s+/, "")} />
                  </h4>
                );
              }

              if (p.trim().startsWith("## ")) {
                return (
                  <h3 key={pIdx} className="message-h2">
                    <InlineMarkdown text={p.trim().replace(/^##\s+/, "")} />
                  </h3>
                );
              }

              return (
                <p key={pIdx} className="message-para">
                  <InlineMarkdown text={p} />
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Inline markdown for bold, inline code
function InlineMarkdown({ text }) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((token, i) => {
        if (token.startsWith("`") && token.endsWith("`")) {
          return (
            <code key={i} className="inline-code">
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith("**") && token.endsWith("**")) {
          return <strong key={i}>{token.slice(2, -2)}</strong>;
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
}

export function Workspace({
  session,
  docs = [],
  chats = [],
  activeChat,
  messages = [],
  busy,
  uploadBusy,
  onNewChat,
  onSelectChat,
  onSendMessage,
  onUploadFile,
  onDeleteDocument,
  onSignOut,
  onBackToLanding,
}) {
  const [question, setQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!question.trim() || busy || !activeChat) return;
    const q = question;
    setQuestion("");
    onSendMessage(q);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSource = (msgIndex, sourceIndex) => {
    const key = `${msgIndex}-${sourceIndex}`;
    setExpandedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredChats = chats.filter((c) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="workspace-root">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`workspace-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* App Workspace Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={onBackToLanding} title="Back to overview">
            <div className="sidebar-logo-glyph">
              <IconSparkles size={16} />
            </div>
            <div className="sidebar-brand-meta">
              <span className="sidebar-brand-name">DocRAG</span>
              <span className="sidebar-workspace-name">Workspace</span>
            </div>
          </div>
          <button
            className="sidebar-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* User Pill & Session info */}
        <div className="sidebar-user-pill">
          <div className="sidebar-user-avatar">
            <IconUser size={13} />
          </div>
          <span className="sidebar-user-email" title={session?.user?.email}>
            {session?.user?.email || "Authenticated User"}
          </span>
          <button
            onClick={onSignOut}
            className="sidebar-logout-btn"
            title="Sign out of workspace"
            aria-label="Sign out"
          >
            <IconLogout size={14} />
          </button>
        </div>

        {/* Action button */}
        <div className="sidebar-action-strip">
          <button
            onClick={() => {
              onNewChat();
              setSidebarOpen(false);
            }}
            className="btn-primary btn-block"
          >
            <IconPlus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Chats Input */}
        <div className="sidebar-search-box">
          <IconSearch size={14} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar-search-input"
          />
        </div>

        {/* ================= CHATS LIST ================= */}
        <div className="sidebar-section-container">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">Conversations</span>
            <span className="sidebar-count-badge">{chats.length}</span>
          </div>

          <div className="sidebar-items-list">
            {filteredChats.length === 0 ? (
              <div className="sidebar-empty-state">
                <span>{searchQuery ? "No matches found" : "No chats yet"}</span>
              </div>
            ) : (
              filteredChats.map((c) => {
                const isActive = activeChat?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`sidebar-chat-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      onSelectChat(c);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="sidebar-chat-title">{c.title || "Untitled Chat"}</span>
                    {c.created_at && (
                      <span className="sidebar-chat-date">{formatTime(c.created_at)}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= DOCUMENTS SECTION ================= */}
        <div className="sidebar-section-container sidebar-docs-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">Knowledge Base</span>
            <span className="sidebar-count-badge">{docs.length}</span>
          </div>

          {/* Upload Dropzone */}
          <label className={`sidebar-upload-dropzone ${uploadBusy ? "busy" : ""}`}>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={onUploadFile}
              disabled={uploadBusy}
            />
            <IconUpload size={16} />
            <span>{uploadBusy ? "Indexing document..." : "Upload PDF, DOCX, TXT"}</span>
          </label>

          <div className="sidebar-items-list sidebar-docs-list">
            {docs.length === 0 ? (
              <div className="sidebar-empty-state">
                <span>No documents uploaded</span>
              </div>
            ) : (
              docs.map((d) => (
                <div key={d.id} className="sidebar-doc-card">
                  <div className="sidebar-doc-left">
                    <div className="sidebar-doc-icon">
                      <IconDocument size={14} />
                    </div>
                    <div className="sidebar-doc-info">
                      <span className="sidebar-doc-name" title={d.filename}>
                        {d.filename}
                      </span>
                      <div className="sidebar-doc-tags">
                        <span className={`sidebar-doc-status status-${d.status}`}>
                          {d.status === "ready" && "Indexed"}
                          {d.status === "processing" && "Processing..."}
                          {d.status === "error" && "Error"}
                        </span>
                        {d.chunk_count !== undefined && d.chunk_count > 0 && (
                          <span className="sidebar-doc-chunks">{d.chunk_count} chunks</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {onDeleteDocument && (
                    <button
                      className="sidebar-doc-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${d.filename}" from knowledge base?`)) {
                          onDeleteDocument(d.id);
                        }
                      }}
                      title="Delete document and vector chunks"
                      aria-label="Delete document"
                    >
                      <IconTrash size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CHAT CANVAS ================= */}
      <main className="workspace-main">
        {/* Workspace Topbar */}
        <header className="workspace-topbar">
          <div className="workspace-topbar-left">
            <button
              className="workspace-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <IconMenu size={18} />
            </button>
            <div className="workspace-current-meta">
              <span className="workspace-chat-name">
                {activeChat ? activeChat.title : "Workspace"}
              </span>
              <span className="workspace-status-pill">
                <span className="status-dot-emerald"></span>
                <span>{docs.length} Documents Grounded</span>
              </span>
            </div>
          </div>

          <div className="workspace-topbar-right">
            <button onClick={onBackToLanding} className="btn-ghost btn-sm">
              Overview
            </button>
          </div>
        </header>

        {/* Conversation Stream */}
        <div className="workspace-messages-container">
          {!activeChat ? (
            <div className="workspace-empty-canvas">
              <div className="workspace-empty-box">
                <div className="workspace-empty-glyph">
                  <IconSparkles size={28} />
                </div>
                <h2>Chat with your documents</h2>
                <p>
                  Upload your PDF, DOCX, TXT or Markdown files in the left sidebar, then create a new
                  chat session to query them with grounded AI citations.
                </p>
                <button onClick={onNewChat} className="btn-primary">
                  <IconPlus size={16} />
                  <span>Start New Conversation</span>
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="workspace-empty-canvas">
              <div className="workspace-empty-box">
                <div className="workspace-empty-glyph">
                  <IconDocument size={28} />
                </div>
                <h2>{activeChat.title}</h2>
                <p>
                  Ask any question about your {docs.length} uploaded document
                  {docs.length === 1 ? "" : "s"}. Responses will be synthesized using retrieved
                  vector chunks.
                </p>

                {/* Suggested Starters */}
                {docs.length > 0 && (
                  <div className="starter-prompts-grid">
                    <button
                      className="starter-prompt-card"
                      onClick={() => setQuestion("Summarize the key objectives and findings of the documents.")}
                    >
                      "Summarize the key objectives and findings"
                    </button>
                    <button
                      className="starter-prompt-card"
                      onClick={() => setQuestion("What are the main methodologies or technical concepts described?")}
                    >
                      "What are the main technical concepts described?"
                    </button>
                    <button
                      className="starter-prompt-card"
                      onClick={() => setQuestion("Extract important statistics, numerical figures, and conclusions.")}
                    >
                      "Extract important figures and conclusions"
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="workspace-messages-list">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    className={`workspace-message-row ${isUser ? "row-user" : "row-assistant"}`}
                  >
                    <div className="message-avatar">
                      {isUser ? <IconUser size={15} /> : <IconBot size={16} />}
                    </div>

                    <div className="message-content-wrapper">
                      <div className="message-header">
                        <span className="message-author">{isUser ? "You" : "DocRAG Assistant"}</span>
                        {m.created_at && (
                          <span className="message-timestamp">{formatTime(m.created_at)}</span>
                        )}
                      </div>

                      <div className="message-body">
                        <FormattedMessage content={m.content} />
                      </div>

                      {/* Source Citations */}
                      {!isUser && m.sources && m.sources.length > 0 && (
                        <div className="sources-container">
                          <span className="sources-label">Grounded Sources:</span>
                          <div className="sources-tags-row">
                            {m.sources.map((s, sIdx) => {
                              const sourceKey = `${idx}-${sIdx}`;
                              const isExpanded = expandedSources[sourceKey];
                              return (
                                <div key={sIdx} className="source-pill-card">
                                  <button
                                    type="button"
                                    className="source-pill-btn"
                                    onClick={() => toggleSource(idx, sIdx)}
                                    title="Click to toggle citation details"
                                  >
                                    <IconQuote size={11} />
                                    <span className="source-pill-filename">{s.filename}</span>
                                    {s.page_number && (
                                      <span className="source-pill-page">p.{s.page_number}</span>
                                    )}
                                    {s.similarity && (
                                      <span className="source-pill-score">
                                        {Math.round(s.similarity * 100)}%
                                      </span>
                                    )}
                                  </button>

                                  {isExpanded && s.content && (
                                    <div className="source-chunk-popover">
                                      <p>{s.content}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Busy thinking indicator */}
              {busy && (
                <div className="workspace-message-row row-assistant thinking-row">
                  <div className="message-avatar">
                    <IconBot size={16} />
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-header">
                      <span className="message-author">DocRAG Assistant</span>
                    </div>
                    <div className="thinking-indicator">
                      <span className="thinking-dot"></span>
                      <span className="thinking-dot"></span>
                      <span className="thinking-dot"></span>
                      <span className="thinking-label">
                        Retrieving vector chunks and generating response...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ================= COMPOSER ================= */}
        {activeChat && (
          <div className="workspace-composer-container">
            <form onSubmit={handleSend} className="workspace-composer-form">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents... (Enter to send, Shift+Enter for newline)"
                rows={1}
                disabled={busy}
                className="workspace-composer-input"
              />

              <div className="workspace-composer-actions">
                <span className="composer-hint-kbd">↵ send</span>
                <button
                  type="submit"
                  disabled={busy || !question.trim()}
                  className="btn-composer-send"
                  aria-label="Send message"
                >
                  <IconSend size={15} />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
