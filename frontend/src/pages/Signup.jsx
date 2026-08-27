import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ErrorBanner from "../components/ErrorBanner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
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
            <h1 className="text-2xl font-serif">Create an Account</h1>
            <p className="text-xs font-mono text-[var(--ink-muted)]">Register for LexAgent Consumer Protection Platform</p>
          </div>

          <ErrorBanner message={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--ink-muted)]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Advocate Rajesh Kumar"
                className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--ink-muted)]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@lexagent.in"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-mono text-sm font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <div className="text-center text-xs text-[var(--ink-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--brass)] hover:underline font-mono">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
