import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewCase from "./pages/NewCase";
import DebateStream from "./pages/DebateStream";
import Verdict from "./pages/Verdict";
import Dashboard from "./pages/Dashboard";
import HowItWorks from "./pages/HowItWorks";
import Profile from "./pages/Profile";
import AdminAnalytics from "./pages/AdminAnalytics";
import StyleGuide from "./pages/StyleGuide";

function RootGate() {
  const { user, accessToken, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="font-mono text-brass">Authenticating LexAgent Session...</span>
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/signup" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Route: Directs unauthenticated users to /signup, Admins to /admin, and Users to / */}
            <Route path="/" element={<RootGate />} />

            {/* Auth Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Information & Design System */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/style-guide" element={<StyleGuide />} />

            {/* Protected User Routes */}
            <Route
              path="/terminal"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-case"
              element={
                <ProtectedRoute>
                  <NewCase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/debate/:threadId"
              element={
                <ProtectedRoute>
                  <DebateStream />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verdict/:threadId"
              element={
                <ProtectedRoute>
                  <Verdict />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<RootGate />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;