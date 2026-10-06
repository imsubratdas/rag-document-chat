import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { Workspace } from "./components/Workspace";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Authenticated API client attaching Supabase access token
async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (e) {
      console.warn("Could not retrieve Supabase session:", e);
    }
  }
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

function MissingConfigScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      background: "#08090d",
      color: "#f7f8f8"
    }}>
      <div style={{
        background: "#0e1017",
        padding: "36px",
        borderRadius: "14px",
        maxWidth: "480px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "20px" }}>Configuration Required</h2>
        <p style={{ color: "#8a8f98", lineHeight: "1.6" }}>
          Supabase environment variables are missing. Please configure them in your environment settings:
        </p>
        <ul style={{
          textAlign: "left",
          lineHeight: "2",
          color: "#a5b4fc",
          fontFamily: "monospace",
          fontSize: "13px",
          marginTop: "16px"
        }}>
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_PUBLISHABLE_KEY</li>
          <li>VITE_API_URL (defaults to http://localhost:8000)</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfigScreen />;
  }

  const [session, setSession] = useState(null);
  const [viewMode, setViewMode] = useState("landing"); // "landing" | "workspace"
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // Workspace Data
  const [docs, setDocs] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);

  // Listen to Supabase Auth state
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const s = data?.session || null;
        setSession(s);
        if (s) {
          setViewMode("workspace");
        }
      })
      .catch((err) => {
        console.error("Auth session check error:", err);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) {
        setViewMode("workspace");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh documents and chats when session is active
  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session]);

  async function refreshData() {
    try {
      const [dRes, cRes] = await Promise.all([
        api("/api/documents"),
        api("/api/chat/conversations"),
      ]);

      if (dRes.ok) {
        const dData = await dRes.json();
        if (Array.isArray(dData)) setDocs(dData);
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData)) {
          setChats(cData);
          // If no active chat but chats exist, select the most recent one
          if (!activeChat && cData.length > 0) {
            openChat(cData[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error refreshing workspace data:", err);
    }
  }

  // Authentication handlers
  async function handleLogin(email, password) {
    setAuthError("");
    setAuthBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data?.session) {
        setAuthModalOpen(false);
        setViewMode("workspace");
      }
    } catch (err) {
      setAuthError(
        err.message || "Failed to reach Supabase server. Please ensure the project is active."
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignup(email, password) {
    setAuthError("");
    setAuthBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        if (data?.session) {
          setAuthModalOpen(false);
          setViewMode("workspace");
        } else {
          alert("Account created! Please check your email inbox to verify your account.");
          setAuthModalOpen(false);
        }
      }
    } catch (err) {
      setAuthError(err.message || "Failed to create account. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setSession(null);
    setActiveChat(null);
    setMessages([]);
    setDocs([]);
    setChats([]);
    setViewMode("landing");
  }

  // Document management handlers
  async function handleUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    setUploadBusy(true);

    try {
      const res = await api("/api/documents/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.detail || "Document upload failed");
      } else {
        await refreshData();
      }
    } catch (err) {
      alert("Network error: Backend server unreachable. Please verify API is running.");
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  async function handleDeleteDocument(documentId) {
    try {
      const res = await api(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== documentId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Could not delete document");
      }
    } catch (err) {
      alert("Network error while deleting document.");
    }
  }

  // Chat handlers
  async function handleNewChat() {
    try {
      const res = await api("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New chat" }),
      });
      const c = await res.json();
      if (res.ok && c?.id) {
        setChats([c, ...chats]);
        openChat(c);
      } else {
        alert(c.detail || "Could not create chat session");
      }
    } catch (err) {
      alert("Network error: Backend server unreachable.");
    }
  }

  async function openChat(chatItem) {
    setActiveChat(chatItem);
    try {
      const res = await api(`/api/chat/conversations/${chatItem.id}/messages`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      }
    } catch (err) {
      console.error("Failed to load conversation messages:", err);
    }
  }

  async function handleSendMessage(promptText) {
    if (!promptText.trim() || !activeChat) return;

    // Optimistically append user message
    setMessages((prev) => [...prev, { role: "user", content: promptText }]);
    setBusy(true);

    try {
      const res = await api("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: activeChat.id,
          content: promptText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Failed to generate answer");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
        refreshData();
      }
    } catch (err) {
      alert("Network error: Backend server unreachable.");
    } finally {
      setBusy(false);
    }
  }

  // Render view
  return (
    <>
      {viewMode === "landing" ? (
        <>
          <Navbar
            session={session}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode);
              setAuthError("");
              setAuthModalOpen(true);
            }}
            onOpenWorkspace={() => setViewMode("workspace")}
            onSignOut={handleSignOut}
          />
          <LandingPage
            session={session}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode);
              setAuthError("");
              setAuthModalOpen(true);
            }}
            onOpenWorkspace={() => setViewMode("workspace")}
          />
        </>
      ) : (
        <Workspace
          session={session}
          docs={docs}
          chats={chats}
          activeChat={activeChat}
          messages={messages}
          busy={busy}
          uploadBusy={uploadBusy}
          onNewChat={handleNewChat}
          onSelectChat={openChat}
          onSendMessage={handleSendMessage}
          onUploadFile={handleUploadFile}
          onDeleteDocument={handleDeleteDocument}
          onSignOut={handleSignOut}
          onBackToLanding={() => setViewMode("landing")}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        errorMessage={authError}
        isBusy={authBusy}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
