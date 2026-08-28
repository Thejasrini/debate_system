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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[var(--line-bright)] bg-[var(--brass-light)] text-[var(--brass)] text-xs font-mono">
            <span>⚖️ Consumer Protection Act, 2019 Platform</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-[var(--brass)]">
            Welcome to <span className="underline decoration-[var(--line-bright)]">LexAgent</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--ink-muted)] font-mono max-w-xl mx-auto">
            Select your role to register or log in to the adversarial legal intelligence platform.
          </p>
        </div>

        {/* If user is already logged in, show current session status */}
        {user ? (
          <div className="w-full max-w-md p-6 rounded-xl border border-[var(--brass)] bg-[var(--surface)] text-center space-y-4 shadow-2xl">
            <div className="p-3 rounded-full bg-[var(--brass-light)] text-[var(--brass)] text-2xl w-12 h-12 mx-auto flex items-center justify-center">
              {user.role === "admin" ? "👑" : "👤"}
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold">{user.name}</h2>
              <p className="text-xs font-mono text-[var(--ink-muted)]">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded text-xs font-mono font-bold uppercase bg-[var(--brass-light)] text-[var(--brass)]">
                Role: {user.role}
              </span>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate(user.role === "admin" ? "/admin" : "/courtroom")}
                className="w-full py-3 rounded-lg font-mono text-sm font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition"
              >
                Go to {user.role === "admin" ? "Admin Dashboard 📊" : "Main Courtroom Terminal ⚖️"}
              </button>
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-lg font-mono text-xs text-[var(--ink-muted)] border border-[var(--line)] hover:border-red-500 hover:text-red-500 transition"
              >
                Sign Out & Switch Account
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg p-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-6 shadow-2xl">
            {/* Step 1: Role Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[var(--brass)] font-semibold uppercase tracking-wider block">
                Step 1: Select Your Access Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                    role === "user"
                      ? "border-[var(--brass)] bg-[var(--brass-light)] text-[var(--brass)] shadow-md"
                      : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink-muted)] hover:border-[var(--line-bright)]"
                  }`}
                >
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="font-serif font-bold text-sm">User</div>
                    <div className="text-[0.7rem] font-mono opacity-80">Consumer / Advocate Dispute Filing</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                    role === "admin"
                      ? "border-[var(--brass)] bg-[var(--brass-light)] text-[var(--brass)] shadow-md"
                      : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink-muted)] hover:border-[var(--line-bright)]"
                  }`}
                >
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="font-serif font-bold text-sm">Admin</div>
                    <div className="text-[0.7rem] font-mono opacity-80">Commission Analytics Portal</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[var(--line)] pt-2">
              <button
                type="button"
                onClick={() => { setIsLoginMode(false); setError(""); }}
                className={`flex-1 py-2 font-mono text-xs font-semibold border-b-2 transition ${
                  !isLoginMode
                    ? "border-[var(--brass)] text-[var(--brass)]"
                    : "border-transparent text-[var(--ink-muted)]"
                }`}
              >
                1. Sign Up (New Account)
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginMode(true); setError(""); }}
                className={`flex-1 py-2 font-mono text-xs font-semibold border-b-2 transition ${
                  isLoginMode
                    ? "border-[var(--brass)] text-[var(--brass)]"
                    : "border-transparent text-[var(--ink-muted)]"
                }`}
              >
                2. Log In (Existing)
              </button>
            </div>

            <ErrorBanner message={error} onClose={() => setError("")} />

            {/* Step 2: Form Input */}
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--ink-muted)]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "admin" ? "District Commission Admin" : "Advocate Rajesh Kumar"}
                    className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink-muted)]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@lexagent.dev" : "user@lexagent.in"}
                  className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink-muted)]">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
                />
              </div>

              {!isLoginMode && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--ink-muted)]">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg font-mono text-sm font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition disabled:opacity-50 shadow-lg mt-2"
              >
                {loading
                  ? "Processing..."
                  : isLoginMode
                  ? `Log In as ${role === "admin" ? "Admin 👑" : "User 👤"}`
                  : `Create ${role === "admin" ? "Admin 👑" : "User 👤"} Account →`}
              </button>
            </form>

            <div className="text-center text-xs text-[var(--ink-muted)] pt-2 border-t border-[var(--line)]">
              {isLoginMode ? (
                <>
                  Need a new account?{" "}
                  <button onClick={() => setIsLoginMode(false)} className="text-[var(--brass)] hover:underline font-mono font-bold">
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button onClick={() => setIsLoginMode(true)} className="text-[var(--brass)] hover:underline font-mono font-bold">
                    Log in here
                  </button>
                </>
              )}
            </div>

            {isLoginMode && role === "admin" && (
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-center text-xs font-mono text-[var(--ink-muted)]">
                💡 Default Admin Login: <span className="text-[var(--brass)] font-bold">admin@lexagent.dev</span> / <span className="text-[var(--brass)] font-bold">admin123</span>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-[var(--line)] text-center text-xs font-mono text-[var(--ink-dim)]">
        LexAgent — Consumer Protection Act 2019 Legal Intelligence Platform © 2026
      </footer>
    </div>
  );
}
