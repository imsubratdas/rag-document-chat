import React, { useState } from "react";
import { IconSparkles, IconMenu, IconClose, IconArrowRight, IconLogout } from "./Icons";

export function Navbar({ session, onOpenAuth, onOpenWorkspace, onSignOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand-group">
          <a href="#" className="navbar-brand">
            <div className="navbar-logo-glyph">
              <IconSparkles size={16} />
            </div>
            <span className="navbar-brand-text">DocRAG</span>
            <span className="navbar-badge-pill">v1.0</span>
          </a>

          {/* Operational status badge */}
          <div className="navbar-status-badge" title="RAG API and Supabase pgvector online">
            <span className="navbar-status-dot"></span>
            <span className="navbar-status-label">Operational</span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="navbar-nav-desktop" aria-label="Main Navigation">
          <button onClick={() => scrollToSection("features")} className="navbar-nav-link">
            Capabilities
          </button>
          <button onClick={() => scrollToSection("pipeline")} className="navbar-nav-link">
            Pipeline
          </button>
          <button onClick={() => scrollToSection("architecture")} className="navbar-nav-link">
            Architecture
          </button>
          <button onClick={() => scrollToSection("stack")} className="navbar-nav-link">
            Tech Stack
          </button>
          <button onClick={() => scrollToSection("use-cases")} className="navbar-nav-link">
            Use Cases
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions-desktop">
          {session ? (
            <div className="navbar-user-actions">
              <button onClick={onOpenWorkspace} className="btn-primary btn-sm">
                Open Workspace
                <IconArrowRight size={14} />
              </button>
              <button
                onClick={onSignOut}
                className="btn-ghost btn-sm"
                title="Sign out of session"
                aria-label="Sign out"
              >
                <IconLogout size={14} />
              </button>
            </div>
          ) : (
            <div className="navbar-auth-actions">
              <button onClick={() => onOpenAuth("login")} className="btn-secondary btn-sm">
                Sign In
              </button>
              <button onClick={() => onOpenAuth("signup")} className="btn-primary btn-sm">
                Launch App
                <IconArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-links">
            <button onClick={() => scrollToSection("features")} className="navbar-mobile-link">
              Capabilities
            </button>
            <button onClick={() => scrollToSection("pipeline")} className="navbar-mobile-link">
              Pipeline
            </button>
            <button onClick={() => scrollToSection("architecture")} className="navbar-mobile-link">
              Architecture
            </button>
            <button onClick={() => scrollToSection("stack")} className="navbar-mobile-link">
              Tech Stack
            </button>
            <button onClick={() => scrollToSection("use-cases")} className="navbar-mobile-link">
              Use Cases
            </button>
          </div>

          <div className="navbar-mobile-actions">
            {session ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWorkspace();
                  }}
                  className="btn-primary btn-block"
                >
                  Open Workspace
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut();
                  }}
                  className="btn-ghost btn-block"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("login");
                  }}
                  className="btn-secondary btn-block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signup");
                  }}
                  className="btn-primary btn-block"
                >
                  Launch App
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
