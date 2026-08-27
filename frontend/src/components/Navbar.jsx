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
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo-text">LexAgent</span>
          <span className="navbar-badge">CPA 2019</span>
        </Link>

        <nav className="navbar-nav">
          {user ? (
            <>
              <Link to="/new-case" className={`navbar-link ${isActive("/new-case") ? "active" : ""}`}>
                + New Case
              </Link>
              <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
                Dashboard
              </Link>
              <Link to="/how-it-works" className={`navbar-link ${isActive("/how-it-works") ? "active" : ""}`}>
                How It Works
              </Link>
              <Link to="/profile" className={`navbar-link ${isActive("/profile") ? "active" : ""}`}>
                Profile ({user.name})
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className={`navbar-link ${isActive("/admin") ? "active" : ""}`}>
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-link border-none bg-transparent cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/how-it-works" className={`navbar-link ${isActive("/how-it-works") ? "active" : ""}`}>
                How It Works
              </Link>
              <Link to="/login" className={`navbar-link ${isActive("/login") ? "active" : ""}`}>
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition"
              >
                Sign Up
              </Link>
            </>
          )}

          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Dark/Light Mode">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}
