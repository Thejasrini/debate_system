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
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif">Welcome Back</h1>
            <p className="text-xs font-mono text-[var(--ink-muted)]">Sign in to access your consumer dispute case threads</p>
          </div>

          <ErrorBanner message={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--ink-muted)]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@lexagent.in"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-mono text-sm font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div className="text-center text-xs text-[var(--ink-muted)]">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[var(--brass)] hover:underline font-mono">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
