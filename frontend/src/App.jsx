import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Primary Entry Page on http://localhost:5173/ is Signup & Role Selection */}
            <Route path="/" element={<Signup />} />

            {/* Explicit Auth Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Main Courtroom Terminal */}
            <Route
              path="/courtroom"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/terminal"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Information & Design System */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/style-guide" element={<StyleGuide />} />

            {/* Protected User Routes */}
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
            <Route path="*" element={<Signup />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;