import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { formatInr, formatInrWhole } from '../utils/formatCurrency';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [campRes, donRes] = await Promise.all([
          api.get('/campaigns/user/me'),
          api.get('/donations/user/me')
        ]);
        setCampaigns(campRes.data);
        setDonations(donRes.data);
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200/50 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-blue-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-slate-400/40">
          {(user.name && user.name.charAt(0).toUpperCase()) || 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">
            {[user.email, user.phone].filter(Boolean).join(' · ') || '—'} •{' '}
            {user.role === 'admin' ? 'Administrator' : 'Supporter'}
          </p>
        </div>
      </div>

      <div className="mb-6 flex space-x-4 border-b border-slate-200/40">
        <button 
          onClick={() => setActiveTab('campaigns')}
          className={`pb-4 px-2 text-lg font-medium transition-all ${activeTab === 'campaigns' ? 'text-slate-700 border-b-2 border-slate-700' : 'text-gray-500 hover:text-gray-800'}`}
        >
          My Campaigns
        </button>
        <button 
          onClick={() => setActiveTab('donations')}
          className={`pb-4 px-2 text-lg font-medium transition-all ${activeTab === 'donations' ? 'text-slate-700 border-b-2 border-slate-700' : 'text-gray-500 hover:text-gray-800'}`}
        >
          My Donations
        </button>
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50">
              <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
              <Link to="/create-campaign" className="text-slate-700 font-bold hover:underline">Start a Campaign</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(camp => {
                const progress = Math.min((camp.raised_amount / camp.goal_amount) * 100, 100).toFixed(1);
                return (
                  <div key={camp.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/campaigns/${camp.id}`} className="text-xl font-bold text-gray-900 hover:text-slate-700 line-clamp-2">
                          {camp.title}
                        </Link>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${camp.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {camp.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                          <div className="bg-slate-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between">
                          <span>{formatInrWhole(camp.raised_amount)} raised</span>
                          <span>{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden">
          {donations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
              <Link to="/campaigns" className="text-slate-700 font-bold hover:underline">Explore Campaigns</Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-medium border-b border-slate-200/40">Campaign</th>
                  <th className="p-4 font-medium border-b border-slate-200/40">Date</th>
                  <th className="p-4 font-medium border-b border-slate-200/40 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map(don => (
                  <tr key={don.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">
                      <Link to={`/campaigns/${don.campaign_id}`} className="hover:text-slate-700">{don.campaign_title}</Link>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(don.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-bold text-slate-700">{formatInr(don.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
