import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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
          <div className="hidden md:flex md:space-x-6 lg:space-x-8">
            <Link to="/home" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Discover</Link>
            <Link to="/campaigns" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Campaigns</Link>
            <Link to="/help" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Help</Link>
            <Link to="/contact" className="text-gray-600 hover:text-slate-700 px-2 py-2 text-sm font-medium transition-colors">Contact</Link>
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-indigo-700 border-l border-gray-200 pl-4 hover:text-indigo-900 py-2 text-sm font-medium transition-colors">Admin Dashboard</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link to="/profile" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-slate-700 transition">Profile</Link>
                <Link to="/create-campaign" className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-slate-700 hover:bg-slate-800 transition-all hover:shadow-md hover:shadow-slate-400/30">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
