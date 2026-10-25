import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Resources from './pages/Resources';
import ResourceDetails from './pages/ResourceDetails';
import UploadResource from './pages/UploadResource';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <UploadResource />
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
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Clean Minimal Footer */}
            <footer className="bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 py-6 border-t border-zinc-200 dark:border-zinc-800 mt-auto transition-colors">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                  <img
                    src="/logo.png"
                    alt="EduShare Logo"
                    className="w-5 h-5 rounded-md object-contain border border-zinc-200 dark:border-zinc-700 bg-white"
                  />
                  <span>EduShare</span>
                </div>
                <div className="text-zinc-400 dark:text-zinc-500">
                  © {new Date().getFullYear()} EduShare.
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
