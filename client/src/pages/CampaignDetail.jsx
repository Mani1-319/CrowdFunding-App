import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ShareMenu from '../components/ShareMenu';
import { publicAssetUrl } from '../utils/publicUrl';
import { getSocketOrigin } from '../utils/env';
import { formatInr, formatInrWhole } from '../utils/formatCurrency';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [donationAmount, setDonationAmount] = useState('');
  /** @type {'upi' | 'netbanking' | 'card'} */
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [reviewText, setReviewText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [donationLoading, setDonationLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [campRes, donRes, revRes] = await Promise.all([
          api.get(`/campaigns/${id}`),
          api.get(`/donations/campaign/${id}`),
          api.get(`/reviews/campaign/${id}`)
        ]);
        
        setCampaign(campRes.data);
        setDonations(donRes.data);
        setReviews(revRes.data);
      } catch (err) {
        toast.error('Failed to load campaign data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    const socketUrl = getSocketOrigin();
    if (!socketUrl) {
      return undefined;
    }
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('campaign_update', (data) => {
      if (Number(data.campaignId) === Number(id)) {
        setCampaign((prev) =>
          prev ? { ...prev, raised_amount: data.raisedAmount } : prev
        );
        setTimeout(async () => {
          const res = await api.get(`/donations/campaign/${id}`);
          setDonations(res.data);
        }, 500);
      }
    });

    return () => socket.disconnect();
  }, [id]);

  const refreshCampaignData = async () => {
    const [campRes, donRes] = await Promise.all([
      api.get(`/campaigns/${id}`),
      api.get(`/donations/campaign/${id}`),
    ]);
    setCampaign(campRes.data);
    setDonations(donRes.data);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    const amt = parseFloat(donationAmount);
    if (!donationAmount || Number.isNaN(amt) || amt <= 0) {
      return toast.error('Please enter a valid amount');
    }

    setDonationLoading(true);
    
    try {
      const orderRes = await api.post('/donations/create-order', {
        amount: amt,
        campaign_id: Number(id),
      });

      const orderData = orderRes.data.order;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey';

      // ** Mock checkout: no Razorpay keys â€” simulate UPI / net banking / card choice **
      if (razorpayKey === 'rzp_test_dummykey') {
        toast(`Simulating ${paymentMethod.toUpperCase()} payment (Razorpay not configured)...`, { icon: 'ðŸ”„' });
        await new Promise((resolve) => setTimeout(resolve, 1200));

        await api.post('/donations/verify', {
          razorpay_order_id: orderData ? orderData.id : 'mock_order_' + Date.now(),
          razorpay_payment_id: `mock_${paymentMethod}_` + Date.now(),
          razorpay_signature: 'mock_signature',
          amount: amt,
          campaign_id: Number(id),
          payment_method: paymentMethod,
        });

        await refreshCampaignData();
        toast.success('Donation successful! Thank you.');
        setDonationAmount('');
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Donte Crowdfunding',
        description: `Donation for ${campaign.title}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await api.post('/donations/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amt,
              campaign_id: Number(id),
            });
            await refreshCampaignData();
            toast.success('Donation successful! Thank you.');
            setDonationAmount('');
          } catch (verifyErr) {
            toast.error('Payment verification failed');
            console.error(verifyErr);
          }
        },
        prefill: {
          name: user ? user.name : '',
          email: user ? user.email : ''
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Error initializing payment');
      console.error(err);
    } finally {
      setDonationLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText) return;

    try {
      await api.post('/reviews', { campaign_id: id, review_text: reviewText });
      toast.success('Review sent successfully');
      setReviewText('');
      // Refresh reviews
      const res = await api.get(`/reviews/campaign/${id}`);
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to post review');
    }
  };

  const handleEndCampaign = async () => {
    if (!window.confirm('Are you sure you want to end this campaign? This will notify you via email.')) return;
    
    try {
      await api.post(`/campaigns/${id}/end`);
      toast.success('Campaign ended successfully. Check your email for the report.');
    } catch (err) {
      toast.error('Failed to end campaign');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
  );

  if (!campaign) return <div className="text-center py-20 text-gray-500">Campaign not found</div>;

  const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100).toFixed(1);
  const isCreator = user && user.id === campaign.user_id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column - Details */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/50">
            {campaign.image_url ? (
              <div className="flex overflow-x-auto gap-2 snap-x snap-mandatory">
                {campaign.image_url.split(',').map((img, idx) => (
                  <img 
                    key={idx}
                    src={publicAssetUrl(img)} 
                    alt={`${campaign.title} - ${idx + 1}`} 
                    className="w-full flex-shrink-0 h-96 object-cover snap-center"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-4xl">Donte</span>
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center text-sm mb-4 gap-2 text-gray-600 font-medium">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-blue-700 text-white flex items-center justify-center font-bold">
                  {campaign.creator_name ? campaign.creator_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>Created by {campaign.creator_name}</span>
                <span className="text-gray-300 mx-2">|</span>
                <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">{campaign.title}</h1>
              
              <div className="prose max-w-none text-gray-600 leading-relaxed font-sans whitespace-pre-wrap">
                {campaign.description}
              </div>

              {(isCreator || isAdmin) && (
                <div className="mt-8 pt-8 border-t border-slate-200/40">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Management Settings</h3>
                  <button 
                    onClick={handleEndCampaign}
                    className="px-6 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg font-medium transition-colors"
                  >
                    End Campaign & Generation Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Suggestions & Reviews</h2>
            
            {(isCreator || isAdmin) && (
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  Reviews are only visible to the campaign creator and admin.
                </p>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 italic">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-slate-200/50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{review.reviewer_name}</span>
                          <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {user && !isCreator && (
              <form onSubmit={handleAddReview} className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave a private review/suggestion for the creator</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white resize-none"
                  placeholder="Your suggestion..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  className="mt-3 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Submit Private Review
                </button>
              </form>
            )}

            {!user && (
              <p className="text-gray-500 italic"><Link to="/login" className="text-slate-700 hover:underline">Log in</Link> to leave a review.</p>
            )}
          </div>
        </div>

        {/* Right Column - Donation Widget */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/80 border border-slate-200/50">
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">{formatInrWhole(campaign.raised_amount)}</span>
                  <span className="text-gray-500 mb-1 font-medium pb-1">raised of {formatInrWhole(campaign.goal_amount)} goal</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-slate-600 via-blue-700 to-indigo-800 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-sm font-semibold text-slate-700">{donations.length} total donations</div>
              </div>

              {isCreator ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                  <h4 className="text-slate-800 font-bold mb-2">Creator View</h4>
                  <p className="text-slate-700 text-sm">You cannot donate to your own campaign. Share the URL with friends and family to gather support!</p>
                </div>
              ) : (
                <form onSubmit={handleDonate} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-lg">₹</span>
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:ring-0 focus:border-slate-600 transition-all text-xl font-bold bg-white shadow-inner"
                      placeholder="Amount to donate"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Payment method</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm, BHIM — opens in Razorpay checkout when keys are added.' },
                        { id: 'netbanking', label: 'Net banking', hint: 'All major banks — available in Razorpay checkout when integrated.' },
                        { id: 'card', label: 'Credit / Debit card', hint: 'Visa, Mastercard, RuPay — processed securely via Razorpay when live.' },
                      ].map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                            paymentMethod === m.id ? 'border-slate-600 bg-slate-50/50' : 'border-slate-200/40 hover:border-slate-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="mt-1"
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id)}
                          />
                          <span>
                            <span className="font-semibold text-gray-900">{m.label}</span>
                            <span className="block text-xs text-gray-500 mt-0.5">{m.hint}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-2">
                      Demo mode: donation is simulated. With real Razorpay keys, this same flow opens checkout with UPI, net banking, and cards.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={donationLoading}
                    className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-slate-400/40 text-white bg-gradient-to-r from-slate-700 to-blue-800 hover:from-slate-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-bold text-lg transition-all ${donationLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                  >
                    {donationLoading ? 'Processing...' : 'Donate Now'}
                  </button>
                  <p className="text-xs text-center text-gray-400 font-medium">
                    UPI · Net banking · Cards (via Razorpay when configured)
                  </p>
                </form>
              )}
              
              <ShareMenu title={campaign.title} />
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Donors</h3>
              {donations.length === 0 ? (
                <p className="text-gray-500 text-sm">Be the first to donate!</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {donations.slice(0, 10).map(donation => (
                    <div key={donation.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                        {donation.donor_name ? donation.donor_name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{donation.donor_name || 'Anonymous'}</div>
                        <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-blue-700">
                          {formatInr(donation.amount)} <span className="text-gray-400 font-normal text-xs ml-1">• {new Date(donation.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
