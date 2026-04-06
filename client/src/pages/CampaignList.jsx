import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { publicAssetUrl } from '../utils/publicUrl';
import { formatInrWhole } from '../utils/formatCurrency';
import { AuthContext } from '../context/AuthContext';

const CampaignList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterStatus, setFilterStatus] = useState('live');
  const [filterCategory, setFilterCategory] = useState('All');
  const categories = ['All', 'Medical', 'Education', 'Tech', 'Community', 'Startup', 'Other'];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch (err) {
        setError('Failed to fetch campaigns. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200/50 max-w-2xl mx-auto my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-8">You need to be logged in to explore campaigns.</p>
        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-slate-700 text-white rounded-full font-medium hover:bg-slate-800 transition">
          Log in Now
        </button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500 font-medium">{error}</div>
  );

  const filteredCampaigns = campaigns.filter(c => {
    const isCompleted = parseFloat(c.raised_amount) >= parseFloat(c.goal_amount);
    if (filterStatus === 'live' && isCompleted) return false;
    if (filterStatus === 'completed' && !isCompleted) return false;

    if (filterCategory !== 'All') {
      const campCategory = c.category || 'Other';
      if (campCategory !== filterCategory) return false;
    }

    return true;
  });

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Discover Campaigns</h1>
        <p className="mt-4 text-xl text-gray-500">Find and support the causes you care about.</p>
      </div>

      <div className="mb-8 flex flex-col gap-6">
        {/* Status Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-full">
            <button
              onClick={() => setFilterStatus('live')}
              className={`px-8 py-2.5 rounded-full font-bold transition-all text-sm ${filterStatus === 'live' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Live Campaigns
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-8 py-2.5 rounded-full font-bold transition-all text-sm ${filterStatus === 'completed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Completed 🎉
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-5 py-2 rounded-full border text-sm font-semibold transition-colors ${filterCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">No campaigns found.</p>
          <Link to="/create-campaign" className="text-slate-700 font-medium hover:text-slate-900">
            Be the first to start a campaign &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((campaign, index) => {
            const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100).toFixed(1);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                key={campaign.id}
              >
                <Link to={`/campaigns/${campaign.id}`} className="block h-full">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col cursor-pointer">
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {campaign.image_url ? (
                        <img 
                          src={publicAssetUrl(campaign.image_url.split(',')[0])} 
                          alt={campaign.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-blue-100 opacity-50 flex items-center justify-center">
                          <span className="text-slate-400 font-bold text-xl">Donte</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center text-xs text-gray-500 mb-3 gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-600 to-blue-700 flex items-center justify-center text-white font-bold">
                          {campaign.creator_name ? campaign.creator_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="truncate">by {campaign.creator_name}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-2">
                        {campaign.title}
                      </h3>
                      
                      <div className="mt-auto space-y-4 pt-4">
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-slate-600 to-blue-700 h-2.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-900">{formatInrWhole(campaign.raised_amount)} raised</span>
                          <span className="text-gray-500">{progress}% of {formatInrWhole(campaign.goal_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
