import React, { useState } from "react";
import {
  IconSparkles,
  IconDocument,
  IconDatabase,
  IconCpu,
  IconShield,
  IconLayers,
  IconArrowRight,
  IconCheck,
  IconBot,
  IconUser,
  IconQuote,
  IconExternalLink,
} from "./Icons";

export function LandingPage({ session, onOpenAuth, onOpenWorkspace }) {
  const [activeMockTab, setActiveMockTab] = useState("chat");

  const handleLaunch = () => {
    if (session) {
      onOpenWorkspace();
    } else {
      onOpenAuth("signup");
    }
  };

  return (
    <div className="landing-root">
      {/* Background radial glow */}
      <div className="landing-bg-glow" aria-hidden="true" />

      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span className="hero-badge-text">
              Multi-Tenant RAG • pgvector • Gemini 3.7 Flash
            </span>
          </div>

          <h1 className="hero-title">
            Document intelligence grounded in{" "}
            <span className="hero-title-gradient">verifiable truth</span>.
          </h1>

          <p className="hero-subtitle">
            Upload complex PDFs, Word documents, and Markdown files. Ask questions in natural
            language and receive synthesized answers anchored to exact document chunks and page numbers.
          </p>

          <div className="hero-cta-group">
            <button onClick={handleLaunch} className="btn-primary btn-lg">
              <span>{session ? "Open Workspace" : "Get Started Free"}</span>
              <IconArrowRight size={16} />
            </button>
            <a href="#pipeline" className="btn-secondary btn-lg">
              Explore RAG Pipeline
            </a>
          </div>

          {/* Metric highlights */}
          <div className="hero-metrics-grid">
            <div className="hero-metric-item">
              <span className="hero-metric-value">384-dim</span>
              <span className="hero-metric-label">Dense Embeddings</span>
            </div>
            <div className="hero-metric-divider"></div>
            <div className="hero-metric-item">
              <span className="hero-metric-value">900 char</span>
              <span className="hero-metric-label">Semantic Chunks</span>
            </div>
            <div className="hero-metric-divider"></div>
            <div className="hero-metric-item">
              <span className="hero-metric-value">Top-6</span>
              <span className="hero-metric-label">HNSW Cosine Match</span>
            </div>
            <div className="hero-metric-divider"></div>
            <div className="hero-metric-item">
              <span className="hero-metric-value">100%</span>
              <span className="hero-metric-label">RLS Row Isolation</span>
            </div>
          </div>

          {/* ================= INTERACTIVE PRODUCT UI PREVIEW ================= */}
          <div className="preview-window-wrapper">
            <div className="preview-window">
              {/* Window Titlebar */}
              <div className="preview-titlebar">
                <div className="preview-traffic-lights">
                  <span className="preview-dot preview-dot-red"></span>
                  <span className="preview-dot preview-dot-yellow"></span>
                  <span className="preview-dot preview-dot-green"></span>
                </div>
                <div className="preview-titlebar-title">
                  <IconDocument size={13} />
                  <span>transformer_architecture.pdf — Workspace Preview</span>
                </div>
                <div className="preview-tab-controls">
                  <button
                    className={`preview-tab-btn ${activeMockTab === "chat" ? "active" : ""}`}
                    onClick={() => setActiveMockTab("chat")}
                  >
                    Dialogue
                  </button>
                  <button
                    className={`preview-tab-btn ${activeMockTab === "chunks" ? "active" : ""}`}
                    onClick={() => setActiveMockTab("chunks")}
                  >
                    Retrieved Chunks
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="preview-body">
                {activeMockTab === "chat" ? (
                  <div className="preview-chat-content">
                    {/* User message */}
                    <div className="preview-msg preview-msg-user">
                      <div className="preview-msg-avatar">
                        <IconUser size={13} />
                      </div>
                      <div className="preview-msg-bubble">
                        <p>How does multi-head self-attention compute query and key interactions?</p>
                      </div>
                    </div>

                    {/* AI message */}
                    <div className="preview-msg preview-msg-ai">
                      <div className="preview-msg-avatar preview-avatar-ai">
                        <IconBot size={14} />
                      </div>
                      <div className="preview-msg-bubble">
                        <p>
                          Multi-head self-attention projects queries, keys, and values \(h\) times with
                          learned linear projections. For each head, the scaled dot-product attention computes:
                        </p>
                        <div className="preview-code-block">
                          <code>Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V</code>
                        </div>
                        <p>
                          The resulting vectors are concatenated and projected again through a final feed-forward layer.
                        </p>

                        {/* Citations tag */}
                        <div className="preview-citations-strip">
                          <span className="preview-citation-badge">
                            <IconQuote size={11} />
                            <span>transformer_architecture.pdf · Page 4 · 91% match</span>
                          </span>
                          <span className="preview-citation-badge">
                            <IconQuote size={11} />
                            <span>transformer_architecture.pdf · Page 5 · 87% match</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-chunks-content">
                    <div className="preview-chunk-card">
                      <div className="preview-chunk-header">
                        <span className="preview-chunk-file">📄 transformer_architecture.pdf</span>
                        <span className="preview-chunk-metric">Page 4 · Similarity: 0.912</span>
                      </div>
                      <p className="preview-chunk-text">
                        "An attention function can be described as mapping a query and a set of key-value
                        pairs to an output, where the query, keys, values, and output are all vectors. The output
                        is computed as a weighted sum of the values..."
                      </p>
                    </div>

                    <div className="preview-chunk-card">
                      <div className="preview-chunk-header">
                        <span className="preview-chunk-file">📄 transformer_architecture.pdf</span>
                        <span className="preview-chunk-metric">Page 5 · Similarity: 0.874</span>
                      </div>
                      <p className="preview-chunk-text">
                        "Multi-head attention allows the model to jointly attend to information from
                        different representation subspaces at different positions. With a single attention head,
                        averaging inhibits this..."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE DOCRAG ================= */}
      <section id="features" className="section-block">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Design Philosophy</span>
            <h2 className="section-title">Built for precision, not guesswork.</h2>
            <p className="section-desc">
              Standard chatbots hallucinate when asked about internal documents. DocRAG enforces strict
              vector grounding so every statement can be independently verified.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <IconShield size={20} />
              </div>
              <h3 className="feature-title">Source Grounded</h3>
              <p className="feature-text">
                The Gemini LLM prompt is constrained strictly to retrieved context. If your files do not
                contain the answer, the model explicitly states it instead of fabricating answers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <IconDocument size={20} />
              </div>
              <h3 className="feature-title">Multi-Format Ingestion</h3>
              <p className="feature-text">
                Upload PDF documents with page tracking via PyMuPDF, Microsoft Word DOCX files, raw Markdown,
                and plain text files up to 20MB per file.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <IconDatabase size={20} />
              </div>
              <h3 className="feature-title">pgvector & HNSW</h3>
              <p className="feature-text">
                Embeddings are indexed in PostgreSQL using Hierarchical Navigable Small World (HNSW) graphs,
                delivering sub-50ms cosine similarity searches across thousands of chunks.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <IconCpu size={20} />
              </div>
              <h3 className="feature-title">Gemini 3.7 Flash Engine</h3>
              <p className="feature-text">
                Leverages Google’s latest Gemini 3.7 Flash model with native thinking capability for
                nuanced reasoning, multi-document synthesis, and concise answers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <IconLayers size={20} />
              </div>
              <h3 className="feature-title">Persistent Chat History</h3>
              <p className="feature-text">
                Conversations and multi-turn message history are stored in PostgreSQL per user, allowing
                you to switch between projects and resume contextual inquiries anytime.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <IconSparkles size={20} />
              </div>
              <h3 className="feature-title">Tenant-Isolated Security</h3>
              <p className="feature-text">
                Every document, chunk, and conversation is strictly isolated using Supabase PostgreSQL Row Level
                Security (RLS). Users can never access or query other accounts' data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5-STEP RAG PIPELINE ================= */}
      <section id="pipeline" className="section-block section-alt">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">The Processing Engine</span>
            <h2 className="section-title">The 5-Step RAG Pipeline</h2>
            <p className="section-desc">
              How your uploaded files are transformed into searchable vector representations and grounded answers.
            </p>
          </div>

          <div className="pipeline-steps-grid">
            <div className="pipeline-card">
              <div className="pipeline-step-badge">01</div>
              <h3 className="pipeline-step-title">Ingest & Parse</h3>
              <p className="pipeline-step-desc">
                Uploaded files (.pdf, .docx, .txt, .md) are parsed. Page numbers are extracted and mapped
                for accurate citation tracking.
              </p>
              <div className="pipeline-step-tag">PyMuPDF + python-docx</div>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">02</div>
              <h3 className="pipeline-step-title">Semantic Chunking</h3>
              <p className="pipeline-step-desc">
                Text is normalized and split into 900-character windows with a 120-character overlap to
                preserve contextual continuity across boundaries.
              </p>
              <div className="pipeline-step-tag">900-char / 120-overlap</div>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">03</div>
              <h3 className="pipeline-step-title">Dense Embedding</h3>
              <p className="pipeline-step-desc">
                Each chunk is passed to <code>all-MiniLM-L6-v2</code> to produce a normalized
                384-dimensional vector embedding capturing semantic meaning.
              </p>
              <div className="pipeline-step-tag">Sentence Transformers</div>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">04</div>
              <h3 className="pipeline-step-title">Vector Retrieval</h3>
              <p className="pipeline-step-desc">
                When you ask a question, its vector query is executed against Supabase <code>pgvector</code> using
                HNSW cosine similarity to fetch the top-6 relevant chunks.
              </p>
              <div className="pipeline-step-tag">pgvector Cosine (Top-6)</div>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">05</div>
              <h3 className="pipeline-step-title">Grounded Generation</h3>
              <p className="pipeline-step-desc">
                The Gemini 3.7 Flash model synthesizes a cohesive answer from the retrieved chunks and returns
                the specific source filenames and pages cited.
              </p>
              <div className="pipeline-step-tag">Gemini 3.7 Flash</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURE SECTION ================= */}
      <section id="architecture" className="section-block">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">System Architecture</span>
            <h2 className="section-title">Designed for modularity and speed.</h2>
            <p className="section-desc">
              An end-to-end multi-tenant system combining a React SPA, a high-performance FastAPI service,
              and managed PostgreSQL vector storage.
            </p>
          </div>

          <div className="arch-diagram-card">
            <div className="arch-flow">
              <div className="arch-node arch-node-client">
                <span className="arch-node-badge">Client Layer</span>
                <span className="arch-node-title">React 19 + Vite SPA</span>
                <span className="arch-node-meta">Linear Dark UI • Auth State</span>
              </div>

              <div className="arch-arrow">
                <span className="arch-arrow-label">Bearer JWT</span>
                <IconArrowRight size={16} />
              </div>

              <div className="arch-node arch-node-backend">
                <span className="arch-node-badge">API Layer</span>
                <span className="arch-node-title">FastAPI + Python 3.11</span>
                <span className="arch-node-meta">Ingestion • Embeddings • Prompting</span>
              </div>

              <div className="arch-arrow">
                <span className="arch-arrow-label">RPC & SQL</span>
                <IconArrowRight size={16} />
              </div>

              <div className="arch-node arch-node-db">
                <span className="arch-node-badge">Data Layer</span>
                <span className="arch-node-title">Supabase (PostgreSQL)</span>
                <span className="arch-node-meta">pgvector(384) • HNSW • Auth RLS</span>
              </div>
            </div>

            <div className="arch-secondary-flow">
              <div className="arch-secondary-item">
                <span className="arch-secondary-title">Vector Ingestion:</span>
                <span>PyMuPDF Loader → Regex Normalizer → SentenceTransformer (384-dim) → Batch PostgreSQL Insert</span>
              </div>
              <div className="arch-secondary-item">
                <span className="arch-secondary-title">Query Execution:</span>
                <span>Query Embedding → match_document_chunks() RPC → Gemini 3.7 Flash Model → Sources Array</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TECHNOLOGY STACK ================= */}
      <section id="stack" className="section-block section-alt">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Verified Tech Stack</span>
            <h2 className="section-title">The technologies behind this project.</h2>
            <p className="section-desc">
              Every tool and dependency listed here is actively used in the production repository.
            </p>
          </div>

          <div className="tech-stack-grid">
            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-tag">Frontend</span>
                <span className="tech-ver">React 19</span>
              </div>
              <h3 className="tech-name">React 19 & Vite 7</h3>
              <p className="tech-desc">
                High-performance Single Page Application with optimized asset bundling, instant HMR,
                and native client-side session routing.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-tag">Backend</span>
                <span className="tech-ver">FastAPI</span>
              </div>
              <h3 className="tech-name">FastAPI & Uvicorn</h3>
              <p className="tech-desc">
                Asynchronous Python backend providing RESTful endpoints, multipart streaming uploads,
                and strict CORS security headers.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-tag">Vector DB</span>
                <span className="tech-ver">pgvector</span>
              </div>
              <h3 className="tech-name">Supabase PostgreSQL</h3>
              <p className="tech-desc">
                Managed PostgreSQL with <code>vector</code> extension, HNSW cosine index, and Row Level Security
                for per-user multi-tenancy.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-tag">LLM Engine</span>
                <span className="tech-ver">Gemini 3.7</span>
              </div>
              <h3 className="tech-name">Google Gemini 3.7 Flash</h3>
              <p className="tech-desc">
                Google GenAI SDK integration with low-latency thinking config to synthesize grounded answers
                from retrieved document context.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-tag">Embeddings</span>
                <span className="tech-ver">all-MiniLM-L6</span>
              </div>
              <h3 className="tech-name">Sentence Transformers</h3>
              <p className="tech-desc">
                Hugging Face sentence-transformers generating 384-dimensional dense vectors on CPU with
                in-memory LRU model caching.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-tag">Document Parser</span>
                <span className="tech-ver">PyMuPDF</span>
              </div>
              <h3 className="tech-name">PyMuPDF & python-docx</h3>
              <p className="tech-desc">
                Fast binary parsing of complex PDF structures and DOCX XML trees with per-page text
                extraction and sanitization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO IS THIS FOR? ================= */}
      <section id="use-cases" className="section-block">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Real-World Workflows</span>
            <h2 className="section-title">Built for knowledge-dense documents.</h2>
            <p className="section-desc">
              Explore how professionals query large files without skimming hundreds of pages.
            </p>
          </div>

          <div className="use-cases-grid">
            <div className="use-case-card">
              <span className="use-case-badge">Software Engineers</span>
              <h3 className="use-case-title">API Specs & Technical Manuals</h3>
              <p className="use-case-text">
                Query architecture decision records, RFCs, and API documentation to find parameter
                contracts and protocol specifications in seconds.
              </p>
            </div>

            <div className="use-case-card">
              <span className="use-case-badge">Researchers & Scholars</span>
              <h3 className="use-case-title">Academic Papers & Preprints</h3>
              <p className="use-case-text">
                Synthesize methodologies, mathematical formulas, experimental results, and references
                across multi-column academic PDF papers.
              </p>
            </div>

            <div className="use-case-card">
              <span className="use-case-badge">Legal & Finance</span>
              <h3 className="use-case-title">Audits, Reports & Contracts</h3>
              <p className="use-case-text">
                Verify compliance clauses, SLA terms, and quarterly earnings data with exact page-number
                citations directly back to the original source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="section-block">
        <div className="section-container">
          <div className="cta-box">
            <h2 className="cta-title">Start chatting with your documents.</h2>
            <p className="cta-desc">
              Upload your first document and experience verifiable, grounded document intelligence.
            </p>
            <div className="cta-actions">
              <button onClick={handleLaunch} className="btn-primary btn-lg">
                <span>{session ? "Launch Workspace" : "Create Free Account"}</span>
                <IconArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer-root">
        <div className="footer-container">
          <div className="footer-brand-side">
            <div className="footer-logo">
              <IconSparkles size={16} />
              <span>DocRAG</span>
            </div>
            <p className="footer-motto">
              Multi-user document retrieval-augmented generation powered by FastAPI, Supabase pgvector, and Gemini 3.7.
            </p>
          </div>

          <div className="footer-links-side">
            <div className="footer-col">
              <span className="footer-col-header">Project</span>
              <a href="#features" className="footer-link">Capabilities</a>
              <a href="#pipeline" className="footer-link">RAG Pipeline</a>
              <a href="#architecture" className="footer-link">Architecture</a>
              <a href="#stack" className="footer-link">Technology</a>
            </div>

            <div className="footer-col">
              <span className="footer-col-header">Source & Code</span>
              <a
                href="https://github.com/imsubratdas/rag-document-chat"
                target="_blank"
                rel="noreferrer"
                className="footer-link footer-link-external"
              >
                <span>GitHub Repository</span>
                <IconExternalLink size={12} />
              </a>
              <button onClick={handleLaunch} className="footer-link">
                Sign In / Register
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DocRAG. Designed with precision for technical portfolios.</p>
        </div>
      </footer>
    </div>
  );
}
