import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-coral transition-colors">Home</Link>
            <Link to="/kiosk" className="text-sm font-medium text-gray-600 hover:text-brand-coral transition-colors">Kiosk</Link>
            <Link to="/check-out" className="text-sm font-medium text-gray-600 hover:text-brand-coral transition-colors">Check-Out</Link>
            <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-brand-coral transition-colors">Admin</Link>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt={user.displayName || ""} /> : <User className="w-4 h-4" />}
                  </div>
                  <span className="hidden lg:inline">{user.displayName}</span>
                </div>
                <button onClick={logout} className="btn-pill btn-outline text-sm py-2 px-4 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-4">
          <Link to="/" className="block text-base font-medium text-gray-600" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/kiosk" className="block text-base font-medium text-gray-600" onClick={() => setIsOpen(false)}>Kiosk</Link>
          <Link to="/check-out" className="block text-base font-medium text-gray-600" onClick={() => setIsOpen(false)}>Check-Out</Link>
          <Link to="/admin" className="block text-base font-medium text-gray-600" onClick={() => setIsOpen(false)}>Admin</Link>
          {user && (
            <button onClick={() => { logout(); setIsOpen(false); }} className="w-full btn-pill btn-outline text-center py-2">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
}
