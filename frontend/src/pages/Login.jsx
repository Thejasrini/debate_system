import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ErrorBanner from "../components/ErrorBanner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser && loggedUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/courtroom");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "32px",
            borderRadius: "16px",
            border: "1px solid var(--line)",
            borderTop: "4px solid var(--brass)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            boxSizing: "border-box"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 className="font-serif text-brass" style={{ fontSize: "1.8rem", margin: "0 0 6px 0", letterSpacing: "0.5px" }}>
              Welcome Back
            </h1>
            <p className="font-mono text-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
              Sign in to access your LexAgent courtroom portal
            </p>
          </div>

          <ErrorBanner message={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.78rem", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@lexagent.in or admin@lexagent.dev"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  backgroundColor: "var(--bg)",
                  color: "var(--ink)",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.78rem", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  backgroundColor: "var(--bg)",
                  color: "var(--ink)",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brass"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.95rem",
                marginTop: "8px",
                boxShadow: "0 4px 14px rgba(201, 164, 94, 0.3)"
              }}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
            <div>
              Don't have an account?{" "}
              <Link to="/signup" className="font-mono text-brass" style={{ fontWeight: "bold", textDecoration: "underline" }}>
                Sign up here
              </Link>
            </div>

            <div
              className="font-mono"
              style={{
                marginTop: "16px",
                padding: "10px",
                borderRadius: "6px",
                backgroundColor: "var(--bg)",
                border: "1px solid var(--line)",
                fontSize: "0.72rem",
                color: "var(--ink-muted)"
              }}
            >
              💡 Default Admin Login: <span className="text-brass" style={{ fontWeight: "bold" }}>admin@lexagent.dev</span> / <span className="text-brass" style={{ fontWeight: "bold" }}>admin123</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="font-mono text-muted" style={{ padding: "20px", borderTop: "1px solid var(--line)", textAlign: "center", fontSize: "0.75rem" }}>
        LexAgent — Consumer Protection Act 2019 Legal Intelligence Platform © 2026
      </footer>
    </div>
  );
}
