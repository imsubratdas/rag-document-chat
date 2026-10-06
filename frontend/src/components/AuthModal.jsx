import React, { useState } from "react";
import { IconSparkles, IconClose, IconAlertCircle, IconArrowRight } from "./Icons";

export function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onLogin,
  onSignup,
  errorMessage,
  isBusy,
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    if (mode === "login") {
      onLogin(email, password);
    } else {
      onSignup(email, password);
    }
  };

  const activeError = localError || errorMessage;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-brand-badge">
            <IconSparkles size={16} />
            <span>DocRAG Workspace</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <IconClose size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="modal-tab-switcher">
          <button
            type="button"
            className={`modal-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setLocalError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => {
              setMode("signup");
              setLocalError("");
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {activeError && (
            <div className="modal-error-alert" role="alert">
              <IconAlertCircle size={15} />
              <span>{activeError}</span>
            </div>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              placeholder="name@company.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="form-input"
              type="password"
              placeholder="••••••••••••"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={isBusy}>
            <span>{isBusy ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}</span>
            <IconArrowRight size={15} />
          </button>

          <p className="modal-disclaimer">
            {mode === "login" ? (
              <>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  className="modal-link-inline"
                  onClick={() => {
                    setMode("signup");
                    setLocalError("");
                  }}
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="modal-link-inline"
                  onClick={() => {
                    setMode("login");
                    setLocalError("");
                  }}
                >
                  Sign in instead
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
