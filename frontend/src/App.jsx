import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
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
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/style-guide" element={<StyleGuide />} />

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
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;