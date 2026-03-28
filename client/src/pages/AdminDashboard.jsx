import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatInr } from '../utils/formatCurrency';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin authentication required');
      navigate('/admin-login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCampaigns();
      fetchAdminData();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns/all');
      setCampaigns(res.data);
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [usersRes, donationsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/donations'),
      ]);
      setUsers(usersRes.data || []);
      setDonations(donationsRes.data || []);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleApprove = async (id, title) => {
    try {
      await api.put('/campaigns/' + id + '/approve');
      toast.success("Campaign '" + title + "' approved!");
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to approve campaign');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm("Are you sure you want to delete campaign '" + title + "'? This cannot be undone.")) return;
    
    try {
      await api.delete('/campaigns/' + id);
      toast.success('Campaign deleted successfully');
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6">
          <div className="text-sm font-semibold text-gray-500">Logged in as</div>
          <div className="mt-2 text-xl font-extrabold text-gray-900">{user?.email || 'Admin'}</div>
          <div className="mt-1 text-sm text-gray-500">Role: {user?.role || 'admin'}</div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6">
          <div className="text-sm font-semibold text-gray-500">Users</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{loadingMeta ? 'â€”' : users.length}</div>
          <div className="mt-1 text-sm text-gray-500">Registered platform users</div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6">
          <div className="text-sm font-semibold text-gray-500">Donations</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{loadingMeta ? '—' : donations.length}</div>
          <div className="mt-1 text-sm text-gray-500">Successful donations recorded</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/40 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">All Campaigns</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm tracking-wider">
                <th className="p-4 font-medium border-y border-slate-200/40">Campaign</th>
                <th className="p-4 font-medium border-y border-slate-200/40">Creator</th>
                <th className="p-4 font-medium border-y border-slate-200/40">Progress</th>
                <th className="p-4 font-medium border-y border-slate-200/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No campaigns found.</td>
                </tr>
              ) : (
                campaigns.map(campaign => {
                  const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100).toFixed(1);
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 line-clamp-1">{campaign.title}</div>
                        <div className="text-sm text-gray-500">ID: {campaign.id}</div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{campaign.creator_name || 'User'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-600 to-blue-700 h-2 rounded-full" style={{ width: progress + '%' }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-10">{progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {campaign.status !== 'approved' && (
                          <button 
                            onClick={() => handleApprove(campaign.id, campaign.title)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => window.open('/campaigns/' + campaign.id, '_blank')}
                          className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(campaign.id, campaign.title)}
                          className="px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200/40 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Users</h2>
            <span className="text-sm text-gray-500">{loadingMeta ? 'Loading…' : users.length + ' total'}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm tracking-wider">
                  <th className="p-4 font-medium border-y border-slate-200/40">Name</th>
                  <th className="p-4 font-medium border-y border-slate-200/40">Email</th>
                  <th className="p-4 font-medium border-y border-slate-200/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingMeta ? (
                  <tr><td colSpan="3" className="p-6 text-gray-500">Loading…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="3" className="p-6 text-gray-500">No users found.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{u.name || '—'}</td>
                      <td className="p-4 text-sm text-gray-700">{u.email}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-slate-50 text-slate-700' : 'bg-amber-50 text-amber-700'}`}>
                          {u.is_active ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200/40 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Donators</h2>
            <span className="text-sm text-gray-500">{loadingMeta ? 'Loading…' : donations.length + ' payments'}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm tracking-wider">
                  <th className="p-4 font-medium border-y border-slate-200/40">Donator</th>
                  <th className="p-4 font-medium border-y border-slate-200/40">Campaign</th>
                  <th className="p-4 font-medium border-y border-slate-200/40 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingMeta ? (
                  <tr><td colSpan="3" className="p-6 text-gray-500">Loading…</td></tr>
                ) : donations.length === 0 ? (
                  <tr><td colSpan="3" className="p-6 text-gray-500">No donations found.</td></tr>
                ) : (
                  donations.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{d.donor_name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{d.donor_email || '—'}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{d.campaign_title || ('#' + d.campaign_id)}</td>
                      <td className="p-4 text-right font-extrabold text-gray-900">{formatInr(d.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
