import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  UploadCloud,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Compass,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors ${
      isActive
        ? 'bg-zinc-100 text-zinc-950 font-bold'
        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-zinc-100 text-zinc-950 font-bold'
        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="EduShare Logo"
                className="w-8 h-8 rounded-lg object-contain border border-zinc-200/80 bg-white p-0.5 shadow-2xs group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-zinc-950 text-base sm:text-lg tracking-tight">
                EduShare
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>
              <NavLink to="/resources" className={navLinkClass}>
                <BookOpen className="w-3.5 h-3.5" />
                Resources
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                <UploadCloud className="w-3.5 h-3.5" />
                Upload
              </NavLink>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Dashboard</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  id="logout-button"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  id="nav-register-btn"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 space-y-1">
          <NavLink
            to="/"
            end
            className={mobileNavLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/resources"
            className={mobileNavLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BookOpen className="w-4 h-4" />
            Resources
          </NavLink>
          <NavLink
            to="/upload"
            className={mobileNavLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <UploadCloud className="w-4 h-4" />
            Upload
          </NavLink>

          <div className="border-t border-zinc-100 pt-2 mt-2">
            {isAuthenticated ? (
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard ({user?.name})
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 text-zinc-800 text-xs font-semibold hover:bg-zinc-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
