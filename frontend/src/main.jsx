import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {createClient} from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function api(path, options={}) {
  const {data:{session}} = await supabase.auth.getSession();
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);
  return fetch(`${API_URL}${path}`, {...options, headers});
}

function App() {
  const [session,setSession] = useState(null);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [docs,setDocs] = useState([]);
  const [chats,setChats] = useState([]);
  const [chat,setChat] = useState(null);
  const [messages,setMessages] = useState([]);
  const [question,setQuestion] = useState("");
  const [busy,setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setSession(data.session));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s) => setSession(s));
    return () => subscription.unsubscribe();
  },[]);

  useEffect(() => { if(session) refresh(); },[session]);

  async function refresh() {
    const [d,c] = await Promise.all([api("/api/documents"), api("/api/chat/conversations")]);
    setDocs(await d.json()); setChats(await c.json());
  }

  async function login(e) {
    e.preventDefault();
    const {error} = await supabase.auth.signInWithPassword({email,password});
    if(error) alert(error.message);
  }

  async function signup() {
    const {error} = await supabase.auth.signUp({email,password});
    if(error) alert(error.message); else alert("Check your email if confirmation is enabled.");
  }

  async function upload(e) {
    const file=e.target.files[0]; if(!file) return;
    const fd=new FormData(); fd.append("file",file);
    setBusy(true);
    const r=await api("/api/documents/upload",{method:"POST",body:fd});
    const data=await r.json();
    setBusy(false);
    if(!r.ok) alert(data.detail || "Upload failed"); else refresh();
  }

  async function newChat() {
    const r=await api("/api/chat/conversations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:"New chat"})});
    const c=await r.json(); setChats([c,...chats]); openChat(c);
  }

  async function openChat(c) {
    setChat(c);
    const r=await api(`/api/chat/conversations/${c.id}/messages`);
    setMessages(await r.json());
  }

  async function send() {
    if(!question.trim() || !chat) return;
    const q=question; setQuestion("");
    setMessages(m=>[...m,{role:"user",content:q}]); setBusy(true);
    const r=await api("/api/chat/message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversation_id:chat.id,content:q})});
    const data=await r.json(); setBusy(false);
    if(!r.ok) return alert(data.detail || "Request failed");
    setMessages(m=>[...m,{role:"assistant",content:data.answer,sources:data.sources}]);
    refresh();
  }

  if(!session) return <main className="auth"><form onSubmit={login}><h1>DocRAG</h1><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button>Login</button><button type="button" onClick={signup}>Create account</button></form></main>;

  return <div className="app">
    <aside>
      <h2>DocRAG</h2>
      <button onClick={newChat}>+ New chat</button>
      <h3>Chats</h3>{chats.map(c=><div className="item" key={c.id} onClick={()=>openChat(c)}>{c.title}</div>)}
      <h3>Documents</h3>
      <label className="upload">{busy?"Processing...":"Upload document"}<input type="file" accept=".pdf,.docx,.txt,.md" onChange={upload}/></label>
      {docs.map(d=><div className="item" key={d.id}>📄 {d.filename}<small>{d.status}</small></div>)}
      <button onClick={()=>supabase.auth.signOut()}>Logout</button>
    </aside>
    <main className="chat">
      {!chat ? <div className="empty"><h1>Chat with your documents</h1><p>Upload a PDF, DOCX, TXT or Markdown file, then create a chat.</p></div> :
      <>
        <div className="messages">{messages.map((m,i)=><div className={m.role} key={i}><div>{m.content}</div>{m.sources?.length>0 && <small>Sources: {m.sources.map((s,j)=><span key={j}>{s.filename}{s.page_number?` p.${s.page_number}`:""} </span>)}</small>}</div>)}</div>
        <div className="composer"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your documents..."/><button onClick={send}>Send</button></div>
      </>}
    </main>
  </div>
}

createRoot(document.getElementById("root")).render(<App />);
