import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const projectName = 'Donte';
  const showLogout = user && user.role === 'admin' && location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen font-sans bg-transparent">
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/85 border-b border-slate-200/50 shadow-sm shadow-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 via-blue-800 to-emerald-950 flex items-center justify-center text-white shadow-lg shadow-slate-400/35">
              <span className="font-extrabold text-lg tracking-tight">A</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-500">Admin</div>
              <div className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                {projectName}
              </div>
            </div>
          </Link>

          {showLogout ? (
            <button
              onClick={() => {
                logout();
                navigate('/home');
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              Logout
            </button>
          ) : (
            <div />
          )}
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

