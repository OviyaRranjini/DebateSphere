import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // For hamburger menu icons

// Custom link component with active highlighting
const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block text-lg font-medium py-2 px-4 rounded-md transition duration-300 ${
        isActive
          ? 'bg-blue-800 text-white shadow-md'
          : 'text-blue-100 hover:text-white hover:bg-blue-600'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar({ isAuthenticated, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-blue-700 shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center space-x-3">
          <button className="md:hidden text-white" onClick={toggleMenu}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link
            to="/"
            className="text-white text-2xl font-bold tracking-wide hover:text-blue-100 transition duration-300"
          >
            DebateSphere
          </Link>
        </div>

        {/* Center: Nav Links (desktop only) */}
        <div className="hidden md:flex space-x-6">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/add">Add Debate</NavLink>
          <NavLink to="/debates">All Debates</NavLink>
          <NavLink to="/chat">Live Chat</NavLink>
          {isAuthenticated && <NavLink to="/mine">My Debates</NavLink>}
        </div>

        {/* Right: Login / Logout */}
        <div>
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="text-lg font-medium py-2 px-3 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-lg font-medium py-2 px-3 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 transition"
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-800 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="p-4 space-y-2">
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/add" onClick={closeMenu}>Add Debate</NavLink>
          <NavLink to="/debates" onClick={closeMenu}>All Debates</NavLink>
          <NavLink to="/chat" onClick={closeMenu}>Live Chat</NavLink>
          {isAuthenticated && <NavLink to="/mine" onClick={closeMenu}>My Debates</NavLink>}
          {isAuthenticated ? (
            <button
              onClick={() => {
                onLogout();
                closeMenu();
              }}
              className="block w-full text-left text-lg py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                navigate('/login');
                closeMenu();
              }}
              className="block w-full text-left text-lg py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md"
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}
