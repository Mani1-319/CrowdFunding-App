import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreateCampaign = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
    category: 'Other'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200/50 max-w-2xl mx-auto my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-8">You need to be logged in to start a campaign.</p>
        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-slate-700 text-white rounded-full font-medium hover:bg-slate-800 transition">
          Log in Now
        </button>
      </div>
    );
  }

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('goal_amount', formData.goal_amount);
      data.append('deadline', formData.deadline);
      data.append('category', formData.category);
      
      if (images && images.length > 0) {
        images.forEach((file) => {
          data.append('images', file);
        });
      }

      const res = await api.post('/campaigns', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Campaign created successfully!');
      navigate(`/campaigns/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/50">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a Campaign</h1>
        <p className="text-gray-500 mb-8">Fill out the details below to launch your fundraising campaign.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
              placeholder="e.g. Support Jane's Medical Recovery"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Other">Other</option>
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Tech">Tech</option>
              <option value="Community">Community</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows="5"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
              placeholder="Tell your story. Why are you raising funds?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount (₹)</label>
              <input
                type="number"
                required
                min="100"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                placeholder="100000"
                value={formData.goal_amount}
                onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Images (up to 5)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-slate-400 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-700 hover:text-slate-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-500 px-1 pt-1">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1 pt-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-semibold">
                  {images && images.length > 0 
                    ? `${images.length} file(s) selected: ` + images.map(i => i.name).join(', ') 
                    : 'PNG, JPG, WEBP up to 5MB (Multiple allowed)'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/40">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-white bg-gradient-to-r from-slate-700 to-blue-800 hover:from-slate-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-medium text-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg'}`}
            >
              {loading ? 'Publishing Campaign...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
