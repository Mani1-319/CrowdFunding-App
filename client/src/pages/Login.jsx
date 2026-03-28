import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState('phone');
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success('Logged in successfully!');
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/welcome');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success(res.data.message);
      if (res.data.emailSent) setForgotStep('reset');
      else if (res.data.emailError) toast.error(String(res.data.emailError).slice(0, 100));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: resetOtp,
        newPassword,
      });
      toast.success(res.data.message);
      setForgotOpen(false);
      setForgotStep('email');
      setForgotEmail('');
      setResetOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phone.replace(/\D/g, '').trim()) {
      return toast.error('Enter your mobile number');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/phone/send-login-otp', { phone });
      toast.success(res.data.message);
      if (!res.data.smsSent && res.data.smsError) {
        toast.error(String(res.data.smsError).slice(0, 160), { duration: 10000 });
      }
      if (!res.data.smsSent) {
        toast('If SMS is not configured, set SMS_LOG_OTP=true in server/.env and read the OTP in the server terminal.', {
          duration: 12000,
        });
      }
      setPhoneStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/phone/login-otp', { phone, otp: phoneOtp });
      login(res.data.user, res.data.token);
      toast.success('Logged in successfully!');
      navigate('/welcome');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/70 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 mt-2">Log in to continue.</p>
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
            <button
              type="button"
              onClick={() => {
                setTab('email');
                setPhoneStep('phone');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'email' ? 'bg-white shadow text-slate-800' : 'text-gray-600'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setTab('phone')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'phone' ? 'bg-white shadow text-slate-800' : 'text-gray-600'
              }`}
            >
              Mobile OTP
            </button>
          </div>

          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotStep('email');
                      setForgotEmail(email);
                    }}
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-white bg-slate-700 hover:bg-slate-800 font-medium text-lg transition-all ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          )}

          {tab === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'phone' && (
                <form onSubmit={handleSendPhoneOtp} className="space-y-5">
                  <p className="text-sm text-gray-600">
                    Weâ€™ll send a one-time code to your number (SMS requires Twilio in server/.env).
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      autoComplete="tel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-800 disabled:opacity-70"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              )}
              {phoneStep === 'otp' && (
                <form onSubmit={handlePhoneOtpLogin} className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setPhoneStep('phone')}
                    className="text-sm text-slate-700 font-medium"
                  >
                    â† Change number
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">6-digit OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-800 disabled:opacity-70"
                  >
                    {loading ? 'Verifying...' : 'Log in with OTP'}
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-700 hover:text-slate-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setForgotOpen(false);
                setForgotStep('email');
              }}
            >
              âœ•
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset password</h3>
            <p className="text-sm text-gray-500 mb-4">
              {forgotStep === 'email'
                ? 'Enter your email. Weâ€™ll send a reset code (email accounts only).'
                : 'Enter the code from your email and choose a new password.'}
            </p>
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotSubmitEmail} className="space-y-4">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-slate-700 text-white font-semibold"
                >
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
            )}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center tracking-widest"
                  placeholder="OTP"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder="New password (8+ chars, letters & numbers)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-slate-700 text-white font-semibold"
                >
                  {loading ? 'Saving...' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
