import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const brandDestination = user
    ? user.role === "admin"
      ? "/admin"
      : "/courtroom"
    : "/";

  return (
    <header className="navbar-header" style={{ width: "100%", borderBottom: "1px solid var(--line)", backgroundColor: "var(--surface)" }}>
      <div className="navbar-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
        <Link to={brandDestination} className="navbar-brand" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span className="navbar-logo-text font-serif" style={{ fontSize: "1.4rem", fontWeight: "600", color: "var(--ink)", letterSpacing: "-0.01em" }}>LexAgent</span>
          <span className="navbar-badge font-mono" style={{ fontSize: "0.72rem", color: "var(--brass)", backgroundColor: "var(--brass-light)", border: "1px solid var(--line-bright)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>CPA 2019</span>
        </Link>

        <nav className="navbar-nav" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user ? (
            <>
              {user.role === "user" && (
                <Link to="/courtroom" className={`navbar-link ${isActive("/courtroom") ? "active" : ""}`} style={{ color: isActive("/courtroom") ? "var(--brass)" : "var(--ink-muted)", textDecoration: "none", fontSize: "0.88rem" }}>
                  ⚖️ Courtroom
                </Link>
              )}
              <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`} style={{ color: isActive("/dashboard") ? "var(--brass)" : "var(--ink-muted)", textDecoration: "none", fontSize: "0.88rem" }}>
                Dashboard
              </Link>
              <Link to="/how-it-works" className={`navbar-link ${isActive("/how-it-works") ? "active" : ""}`} style={{ color: isActive("/how-it-works") ? "var(--brass)" : "var(--ink-muted)", textDecoration: "none", fontSize: "0.88rem" }}>
                How It Works
              </Link>
              <Link to="/profile" className={`navbar-link ${isActive("/profile") ? "active" : ""}`} style={{ color: isActive("/profile") ? "var(--brass)" : "var(--ink-muted)", textDecoration: "none", fontSize: "0.88rem" }}>
                Profile ({user.name})
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className={`navbar-link ${isActive("/admin") ? "active" : ""}`} style={{ color: isActive("/admin") ? "var(--brass)" : "var(--ink-muted)", textDecoration: "none", fontSize: "0.88rem" }}>
                  👑 Admin Portal
                </Link>
              )}
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                Logout
              </button>
            </>
          ) : null}

          <button onClick={toggleTheme} className="theme-toggle-btn font-mono" style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--line)", backgroundColor: "var(--surface)", color: "var(--ink)", fontSize: "0.82rem", cursor: "pointer" }} title="Toggle Dark/Light Mode">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}
