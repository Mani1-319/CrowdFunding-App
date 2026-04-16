import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12 tracking-tight">How would you like to use the platform today?</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Donor Path */}
        <Link to="/campaigns" className="bg-white/85 backdrop-blur-sm rounded-3xl p-10 border-2 border-slate-200/40 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col items-center text-center cursor-pointer">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 text-slate-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-slate-300/50 transition-all duration-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-slate-800 transition-colors">I want to Donate</h2>
          <p className="text-gray-500 font-medium">Discover life-changing campaigns and support causes you care deeply about.</p>
        </Link>
        
        {/* Campaigner Path */}
        <Link to="/create-campaign" className="bg-white/85 backdrop-blur-sm rounded-3xl p-10 border-2 border-blue-100/40 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col items-center text-center cursor-pointer">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-emerald-100 text-blue-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-200/60 transition-all duration-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">Start a Campaign</h2>
          <p className="text-gray-500 font-medium">Raise funds quickly for yourself, your organization, or someone in need.</p>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
