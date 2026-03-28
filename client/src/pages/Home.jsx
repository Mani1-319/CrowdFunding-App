import React from 'react';
import { formatInrWhole } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white/75 backdrop-blur-sm py-20 lg:py-32 rounded-3xl shadow-sm border border-slate-200/50 shadow-slate-900/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-slate-100 to-blue-100 opacity-50 blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-100 to-slate-100 opacity-50 blur-3xl mix-blend-multiply"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            Fund the <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-blue-800">Future</span> You Believe In
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10"
          >
            Join thousands of passionate individuals making a real difference. Start your campaign today or support causes that matter to you.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/create-campaign" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-slate-700 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
              Start a Campaign
            </Link>
            <Link to="/campaigns" className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all hover:shadow-md active:scale-95">
              Explore Campaigns
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Campaigns Placeholder */}
      <section className="mt-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Trending Campaigns</h2>
            <p className="mt-2 text-gray-500">Discover causes that people are supporting right now.</p>
          </div>
          <Link to="/campaigns" className="text-slate-700 font-medium hover:text-slate-900 transition-colors hidden sm:block">
            View all &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mock Campaign Cards - We'll replace this with real data later */}
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden group cursor-pointer shadow-slate-900/10"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10"></div>
                {/* Fallback pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/20">
                    Medical
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors">
                  Support Jane's Medical Recovery
                </h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                  Jane recently had a severe accident and needs support for her extensive medical bills and physical therapy.
                </p>
                <div className="space-y-3">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-600 to-blue-700 h-2 rounded-full w-3/4"></div>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900">{formatInrWhole(75000)} raised</span>
                    <span className="text-gray-500">75% of {formatInrWhole(100000)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
