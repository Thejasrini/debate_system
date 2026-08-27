import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { updatePasswordApi } from "../services/authApi";
import { getUserStatsApi } from "../services/historyApi";

export default function Profile() {
  const { user, accessToken } = useAuth();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getUserStatsApi(accessToken);
        setStats(data);
      } catch (err) {
        console.warn("⚠️ Failed to load user metrics.");
      } finally {
        setLoadingStats(false);
      }
    }
    if (accessToken) loadStats();
  }, [accessToken]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setUpdating(true);
    try {
      await updatePasswordApi(currentPassword, newPassword, accessToken);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        <div className="border-b border-[var(--line)] pb-6">
          <h1 className="text-3xl font-serif">User Account Profile</h1>
          <p className="text-sm font-mono text-[var(--ink-muted)] mt-1">Manage credentials and view legal intelligence usage metrics</p>
        </div>

        <ErrorBanner message={error} onClose={() => setError("")} />

        {success && (
          <div className="p-4 rounded-lg border border-[var(--support-green)] bg-[var(--support-bg)] text-[var(--support-green-bright)] text-sm font-mono">
            ✓ {success}
          </div>
        )}

        {/* User Info & Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Account Info */}
          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <h3 className="font-serif text-lg text-[var(--brass)]">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-mono text-xs text-[var(--ink-dim)]">FULL NAME</span>
                <p className="font-medium text-[var(--ink)]">{user?.name}</p>
              </div>
              <div>
                <span className="font-mono text-xs text-[var(--ink-dim)]">EMAIL ADDRESS</span>
                <p className="font-mono text-[var(--ink)]">{user?.email}</p>
              </div>
              <div>
                <span className="font-mono text-xs text-[var(--ink-dim)]">SYSTEM ROLE</span>
                <p className="font-mono text-[var(--brass)] uppercase">{user?.role || "User"}</p>
              </div>
            </div>
          </div>

          {/* User Usage Statistics */}
          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <h3 className="font-serif text-lg text-[var(--brass)]">Usage Statistics</h3>
            {loadingStats ? (
              <LoadingSpinner message="Calculating metrics..." />
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded bg-[var(--bg)] border border-[var(--line)]">
                  <span className="font-mono text-2xl text-[var(--brass)] font-bold">{stats?.totalCases || 0}</span>
                  <p className="text-xs font-mono text-[var(--ink-muted)] mt-1">Total Cases</p>
                </div>
                <div className="p-3 rounded bg-[var(--bg)] border border-[var(--line)]">
                  <span className="font-mono text-2xl text-[var(--brass)] font-bold">{stats?.totalTurns || 0}</span>
                  <p className="text-xs font-mono text-[var(--ink-muted)] mt-1">Debate Turns</p>
                </div>
                <div className="p-3 rounded bg-[var(--bg)] border border-[var(--line)]">
                  <span className="font-mono text-2xl text-[var(--support-green-bright)] font-bold">
                    {stats?.averageConfidence || 0}%
                  </span>
                  <p className="text-xs font-mono text-[var(--ink-muted)] mt-1">Avg Confidence</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-6">
          <h3 className="font-serif text-lg">Change Account Password</h3>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--ink-muted)]">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--ink-muted)]">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[var(--ink-muted)]">Confirm New Password</label>
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
              disabled={updating}
              className="px-6 py-2.5 rounded-lg font-mono text-xs font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Password →"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
