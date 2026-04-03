import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200/50 shadow-sm shadow-slate-900/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to={user ? "/welcome" : "/home"} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 via-blue-700 to-indigo-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-400/40">
                <span className="text-white font-bold text-xl tracking-tighter">D</span>
              </div>
              <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                Donte
              </span>
            </Link>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex md:space-x-6 lg:space-x-8">
            <Link to="/home" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Discover</Link>
            <Link to="/campaigns" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Campaigns</Link>
            <Link to="/help" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Help</Link>
            <Link to="/contact" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Contact</Link>
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-indigo-700 border-l border-gray-200 pl-4 hover:text-indigo-900 py-2 text-sm font-medium transition-colors">Admin Dashboard</Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-slate-700 transition">Profile</Link>
                <Link to="/create-campaign" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-slate-700 hover:bg-slate-800 transition-all hover:shadow-md hover:shadow-slate-400/30">
                  Start Campaign
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-slate-700 to-blue-800 hover:from-slate-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all hover:shadow-lg hover:shadow-slate-400/35 transform hover:-translate-y-0.5"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full"
        >
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link to="/home" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50">Discover</Link>
            <Link to="/campaigns" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50">Campaigns</Link>
            <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50">Help</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50">Contact</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50">Admin Dashboard</Link>
            )}
          </div>
          
          <div className="pt-4 pb-6 border-t border-gray-100 px-4">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold mr-3">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </div>
                <div className="space-y-2 mt-4">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Profile</Link>
                  <Link to="/create-campaign" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 rounded-xl text-white bg-slate-700 hover:bg-slate-800 font-medium">Start Campaign</Link>
                  <button onClick={handleLogout} className="w-full mt-2 text-center text-red-600 font-medium py-2">Logout</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Log in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-2.5 rounded-xl text-white bg-slate-700 hover:bg-slate-800 font-medium">Sign up</Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
