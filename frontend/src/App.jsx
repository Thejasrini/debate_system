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
import Profile from "./pages/Profile";
import AdminAnalytics from "./pages/AdminAnalytics";
import StyleGuide from "./pages/StyleGuide";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth & Landing */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Main Courtroom Engine Alias Routes */}
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
            <Route path="/about-us" element={<AboutUs />} />
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

            {/* Admin Dedicated Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminAnalytics defaultTab="overview" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/overview"
              element={
                <ProtectedRoute>
                  <AdminAnalytics defaultTab="overview" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminAnalytics defaultTab="users" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cases"
              element={
                <ProtectedRoute>
                  <AdminAnalytics defaultTab="cases" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute>
                  <AdminAnalytics defaultTab="feedback" />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;