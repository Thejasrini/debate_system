import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ErrorBanner from "../components/ErrorBanner";

export default function Signup() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [role, setRole] = useState("user"); // "user" or "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);
    try {
      let authUser;
      if (isLoginMode) {
        authUser = await login(email, password);
      } else {
        authUser = await signup(name, email, password, role);
      }

      if (authUser && authUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/courtroom");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", maxWidth: "900px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="font-serif text-brass" style={{ fontSize: "2.5rem", margin: "0 0 10px 0", letterSpacing: "0.5px" }}>
            Welcome to <span style={{ textDecoration: "underline", textDecorationColor: "var(--line-bright)" }}>LexAgent</span>
          </h1>

          <p className="font-mono text-muted" style={{ fontSize: "0.9rem", margin: 0, maxWidth: "560px" }}>
            Select your access role to register or log in to the adversarial legal intelligence platform.
          </p>
        </div>

        {/* If user is already logged in */}
        {user ? (
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "32px",
              borderRadius: "16px",
              border: "2px solid var(--brass)",
              backgroundColor: "var(--surface)",
              textAlign: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.3)"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "var(--brass-light)",
                color: "var(--brass)",
                fontSize: "1.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto"
              }}
            >
              {user.role === "admin" ? "👑" : "👤"}
            </div>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", margin: "0 0 4px 0", color: "var(--ink)" }}>{user.name}</h2>
            <p className="font-mono text-muted" style={{ fontSize: "0.82rem", margin: "0 0 12px 0" }}>{user.email}</p>
            <span
              className="font-mono"
              style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                backgroundColor: "var(--brass-light)",
                color: "var(--brass)",
                border: "1px solid var(--line-bright)"
              }}
            >
              Role: {user.role}
            </span>

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => navigate(user.role === "admin" ? "/admin" : "/courtroom")}
                className="btn-brass"
                style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
              >
                Go to {user.role === "admin" ? "Admin Dashboard 📊" : "Main Courtroom Terminal ⚖️"}
              </button>
              <button
                onClick={logout}
                className="btn-outline-brass"
                style={{ width: "100%", padding: "12px", fontSize: "0.85rem" }}
              >
                Sign Out & Switch Account
              </button>
            </div>
          </div>
        ) : (
          /* Main Auth Form Card */
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--line)",
              borderTop: "4px solid var(--brass)",
              backgroundColor: "var(--surface)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              boxSizing: "border-box"
            }}
          >
            {/* Step 1: Role Selection Cards */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="font-mono text-brass"
                style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}
              >
                Step 1: Select Your Access Role
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* User Role Button */}
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: role === "user" ? "2px solid var(--brass)" : "1px solid var(--line)",
                    backgroundColor: role === "user" ? "var(--brass-light)" : "var(--bg)",
                    color: role === "user" ? "var(--brass)" : "var(--ink-muted)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>👤</div>
                  <div className="font-serif" style={{ fontSize: "0.95rem", fontWeight: "bold", color: role === "user" ? "var(--brass)" : "var(--ink)" }}>
                    User
                  </div>
                  <div className="font-mono" style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "2px" }}>
                    Consumer / Advocate Dispute Filing
                  </div>
                </button>

                {/* Admin Role Button */}
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: role === "admin" ? "2px solid var(--brass)" : "1px solid var(--line)",
                    backgroundColor: role === "admin" ? "var(--brass-light)" : "var(--bg)",
                    color: role === "admin" ? "var(--brass)" : "var(--ink-muted)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>👑</div>
                  <div className="font-serif" style={{ fontSize: "0.95rem", fontWeight: "bold", color: role === "admin" ? "var(--brass)" : "var(--ink)" }}>
                    Admin
                  </div>
                  <div className="font-mono" style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "2px" }}>
                    Commission Analytics Portal
                  </div>
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => { setIsLoginMode(false); setError(""); }}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "0.82rem",
                  fontWeight: "bold",
                  background: "none",
                  border: "none",
                  borderBottom: !isLoginMode ? "3px solid var(--brass)" : "3px solid transparent",
                  color: !isLoginMode ? "var(--brass)" : "var(--ink-muted)",
                  cursor: "pointer"
                }}
              >
                1. Sign Up (New Account)
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginMode(true); setError(""); }}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "0.82rem",
                  fontWeight: "bold",
                  background: "none",
                  border: "none",
                  borderBottom: isLoginMode ? "3px solid var(--brass)" : "3px solid transparent",
                  color: isLoginMode ? "var(--brass)" : "var(--ink-muted)",
                  cursor: "pointer"
                }}
              >
                2. Log In (Existing)
              </button>
            </div>

            {/* Step 2: Form Input */}
            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {!isLoginMode && (
                <div>
                  <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.78rem", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "admin" ? "District Commission Admin" : "Advocate Rajesh Kumar"}
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
              )}

              <div>
                <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.78rem", marginBottom: "6px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@lexagent.dev" : "user@lexagent.in"}
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

              {!isLoginMode && (
                <div>
                  <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.78rem", marginBottom: "6px" }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              )}

              <ErrorBanner message={error} onClose={() => setError("")} />

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
                {loading
                  ? "Processing..."
                  : isLoginMode
                  ? `Log In as ${role === "admin" ? "Admin 👑" : "User 👤"}`
                  : `Create ${role === "admin" ? "Admin 👑" : "User 👤"} Account →`}
              </button>
            </form>

            <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
              {isLoginMode ? (
                <>
                  Need a new account?{" "}
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className="font-mono text-brass"
                    style={{ background: "none", border: "none", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className="font-mono text-brass"
                    style={{ background: "none", border: "none", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Log in here
                  </button>
                </>
              )}
            </div>

            {isLoginMode && role === "admin" && (
              <div
                className="font-mono"
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--line)",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "var(--ink-muted)"
                }}
              >
                💡 Default Admin Login: <span className="text-brass" style={{ fontWeight: "bold" }}>admin@lexagent.dev</span> / <span className="text-brass" style={{ fontWeight: "bold" }}>admin123</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
