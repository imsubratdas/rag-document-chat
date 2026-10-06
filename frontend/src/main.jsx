import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {createClient} from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

async function api(path, options={}) {
  const headers = new Headers(options.headers || {});
  if (supabase) {
    try {
      const {data} = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (e) {
      console.warn("Could not retrieve Supabase session:", e);
    }
  }
  return fetch(`${API_URL}${path}`, {...options, headers});
}

function MissingConfigScreen() {
  return (
    <main className="auth">
      <div style={{background: "#11172a", padding: "30px", borderRadius: "12px", maxWidth: "480px", border: "1px solid #303a58"}}>
        <h1 style={{marginTop: 0}}>Configuration Required</h1>
        <p>Supabase environment variables are missing. Please add them to your <code>.env</code> file (or Vercel project environment settings):</p>
        <ul style={{textAlign: "left", lineHeight: "1.8", color: "#a5b4fc"}}>
          <li><code>VITE_SUPABASE_URL</code></li>
          <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
          <li><code>VITE_API_URL</code> (Optional, defaults to <code>http://localhost:8000</code>)</li>
        </ul>
      </div>
    </main>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfigScreen />;
  }

  const [session,setSession] = useState(null);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [docs,setDocs] = useState([]);
  const [chats,setChats] = useState([]);
  const [chat,setChat] = useState(null);
  const [messages,setMessages] = useState([]);
  const [question,setQuestion] = useState("");
  const [busy,setBusy] = useState(false);
  const [errorMessage,setErrorMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession()
      .then(({data}) => setSession(data?.session || null))
      .catch(err => {
        console.error("Auth session check error:", err);
        setErrorMessage("Unable to connect to Supabase. If your database is paused/inactive, restore it in Supabase dashboard.");
      });

    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s) => setSession(s));
    return () => subscription.unsubscribe();
  },[]);

  useEffect(() => { if(session) refresh(); },[session]);

  async function refresh() {
    try {
      const [d,c] = await Promise.all([
        api("/api/documents"),
        api("/api/chat/conversations")
      ]);
      if (d.ok) {
        const docsData = await d.json();
        if (Array.isArray(docsData)) setDocs(docsData);
      } else {
        const err = await d.json().catch(() => ({}));
        console.warn("Documents fetch error:", err);
      }
      if (c.ok) {
        const chatsData = await c.json();
        if (Array.isArray(chatsData)) setChats(chatsData);
      } else {
        const err = await c.json().catch(() => ({}));
        console.warn("Chats fetch error:", err);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }

  async function login(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const {error} = await supabase.auth.signInWithPassword({email,password});
      if(error) {
        alert(error.message);
      }
    } catch (err) {
      alert("Connection error: " + (err.message || "Failed to reach Supabase server. Check if project is active."));
    }
  }

  async function signup() {
    setErrorMessage("");
    try {
      const {error} = await supabase.auth.signUp({email,password});
      if(error) {
        alert(error.message);
      } else {
        alert("Check your email if confirmation is enabled.");
      }
    } catch (err) {
      alert("Connection error: " + (err.message || "Failed to reach Supabase server. Check if project is active."));
    }
  }

  async function upload(e) {
    const file=e.target.files[0]; if(!file) return;
    const fd=new FormData(); fd.append("file",file);
    setBusy(true);
    try {
      const r=await api("/api/documents/upload",{method:"POST",body:fd});
      const data=await r.json().catch(() => ({}));
      if(!r.ok) alert(data.detail || "Upload failed"); else refresh();
    } catch (err) {
      alert("Network error: Backend server unreachable. Make sure the API is running.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function newChat() {
    try {
      const r=await api("/api/chat/conversations",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({title:"New chat"})
      });
      const c=await r.json();
      if (r.ok && c?.id) {
        setChats([c,...chats]);
        openChat(c);
      } else {
        alert(c.detail || "Could not create chat");
      }
    } catch (err) {
      alert("Network error: Backend server unreachable.");
    }
  }

  async function openChat(c) {
    setChat(c);
    try {
      const r=await api(`/api/chat/conversations/${c.id}/messages`);
      if (r.ok) {
        const msgs = await r.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  async function send() {
    if(!question.trim() || !chat) return;
    const q=question; setQuestion("");
    setMessages(m=>[...m,{role:"user",content:q}]); setBusy(true);
    try {
      const r=await api("/api/chat/message",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({conversation_id:chat.id,content:q})
      });
      const data=await r.json();
      if(!r.ok) {
        alert(data.detail || "Request failed");
      } else {
        setMessages(m=>[...m,{role:"assistant",content:data.answer,sources:data.sources}]);
        refresh();
      }
    } catch (err) {
      alert("Network error: Backend server unreachable.");
    } finally {
      setBusy(false);
    }
  }

  if(!session) return (
    <main className="auth">
      <form onSubmit={login}>
        <h1>DocRAG</h1>
        {errorMessage && <div style={{color: "#f87171", fontSize: "0.9rem", textAlign: "center"}}>{errorMessage}</div>}
        <input placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
        <input type="password" placeholder="Password" required value={password} onChange={e=>setPassword(e.target.value)}/>
        <button type="submit">Login</button>
        <button type="button" onClick={signup}>Create account</button>
      </form>
    </main>
  );

  return (
    <div className="app">
      <aside>
        <h2>DocRAG</h2>
        <button onClick={newChat}>+ New chat</button>
        <h3>Chats</h3>
        {chats.map(c=><div className="item" key={c.id} onClick={()=>openChat(c)}>{c.title}</div>)}
        <h3>Documents</h3>
        <label className="upload">{busy?"Processing...":"Upload document"}<input type="file" accept=".pdf,.docx,.txt,.md" onChange={upload}/></label>
        {docs.map(d=><div className="item" key={d.id}>📄 {d.filename}<small>{d.status}</small></div>)}
        <button onClick={()=>supabase.auth.signOut()}>Logout</button>
      </aside>
      <main className="chat">
        {!chat ? (
          <div className="empty">
            <h1>Chat with your documents</h1>
            <p>Upload a PDF, DOCX, TXT or Markdown file, then create a chat.</p>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.map((m,i)=>(
                <div className={m.role} key={i}>
                  <div>{m.content}</div>
                  {m.sources?.length>0 && (
                    <small>
                      Sources: {m.sources.map((s,j)=>(
                        <span key={j}>{s.filename}{s.page_number?` p.${s.page_number}`:""} </span>
                      ))}
                    </small>
                  )}
                </div>
              ))}
            </div>
            <div className="composer">
              <input
                value={question}
                onChange={e=>setQuestion(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!busy&&send()}
                placeholder="Ask about your documents..."
                disabled={busy}
              />
              <button onClick={send} disabled={busy}>{busy ? "Thinking..." : "Send"}</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
