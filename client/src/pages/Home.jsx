import React from 'react';
import { formatInrWhole } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white/75 dark:bg-slate-900/75 backdrop-blur-sm py-20 lg:py-32 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 shadow-slate-900/10 dark:shadow-black/30">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-slate-100 to-blue-100 opacity-50 blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-100 to-slate-100 opacity-50 blur-3xl mix-blend-multiply"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
          >
            Fund the <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-blue-800">Future</span> You Believe In
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-slate-400 mb-10"
          >
            Join thousands of passionate individuals making a real difference. Start your campaign today or support causes that matter to you.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/create-campaign" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white dark:text-slate-900 bg-slate-800 dark:bg-white hover:bg-slate-900 dark:hover:bg-slate-200 transition-all hover:scale-105 active:scale-95">
              Start a Campaign
            </Link>
            <Link to="/campaigns" className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 dark:border-slate-700 text-lg font-medium rounded-full text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:shadow-md active:scale-95">
              Explore Campaigns
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Campaigns Placeholder */}
      <section className="mt-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Trending Campaigns</h2>
            <p className="mt-2 text-gray-500 dark:text-slate-400">Discover causes that people are supporting right now.</p>
          </div>
          <Link to="/campaigns" className="text-slate-700 font-medium hover:text-slate-900 transition-colors hidden sm:block">
            View all &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mock Campaign Cards - We'll replace this with real data later */}
          {[
            {
              id: 1,
              title: "Help Rebuild the Community Center",
              description: "Our local community center was heavily damaged in the recent storm. Help us rebuild a safe space for our youth.",
              category: "Community",
              raised: 250000,
              goal: 500000,
              image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
              id: 2,
              title: "Tech Education for Underprivileged Kids",
              description: "We are providing laptops and weekend coding bootcamps for 100 dedicated students from low-income families.",
              category: "Education",
              raised: 150000,
              goal: 200000,
              image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
              id: 3,
              title: "Support Eco-Friendly Urban Farming",
              description: "Help us launch a sustainable urban farm addressing local food deserts while promoting green living.",
              category: "Startup",
              raised: 85000,
              goal: 100000,
              image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            }
          ].map((camp) => (
            <motion.div 
              key={camp.id}
              whileHover={{ y: -5 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800 overflow-hidden group cursor-pointer shadow-slate-900/10 dark:shadow-black/30"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img src={camp.image} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/20 shadow-sm">
                    {camp.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-1">
                  {camp.title}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                  {camp.description}
                </p>
                <div className="space-y-3">
                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-slate-600 to-blue-700 h-2 rounded-full"
                      style={{ width: `${Math.min((camp.raised / camp.goal) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900 dark:text-white">{formatInrWhole(camp.raised)} raised</span>
                    <span className="text-gray-500 dark:text-slate-400">{Math.round((camp.raised / camp.goal) * 100)}% of {formatInrWhole(camp.goal)}</span>
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
