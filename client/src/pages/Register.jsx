import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [registerMode, setRegisterMode] = useState('email');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [phoneData, setPhoneData] = useState({ name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const canResend = useMemo(() => resendCooldown === 0 && !loading, [resendCooldown, loading]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const applyRegisterResponse = (res) => {
    if (res.data.emailSent || res.data.smsSent) {
      toast.success(res.data.message);
    } else {
      toast.error(res.data.message || 'Could not send verification code.');
      if (res.data.emailError) {
        toast.error(`SMTP Error: ${String(res.data.emailError).slice(0, 120)}`, { duration: 10000 });
      }
      if (res.data.smsError) {
        toast.error(String(res.data.smsError).slice(0, 140), { duration: 10000 });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      applyRegisterResponse(res);
      setOtp('');
      setOtpStep(true);
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register-phone', phoneData);
      applyRegisterResponse(res);
      setOtp('');
      setOtpStep(true);
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      toast.success('Account verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-phone', { phone: phoneData.phone, otp });
      toast.success('Mobile verified! You can now log in with Mobile OTP.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      if (registerMode === 'email') {
        const res = await api.post('/auth/register', formData);
        applyRegisterResponse(res);
      } else {
        const res = await api.post('/auth/register-phone', phoneData);
        applyRegisterResponse(res);
      }
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyTitle = registerMode === 'email' ? 'Verify Email' : 'Verify Mobile';
  const verifyHint =
    registerMode === 'email'
      ? 'Enter the 6-digit code sent to your email (check spam).'
      : 'Enter the 6-digit code sent by SMS to your phone.';

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -ml-10 -mt-10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100/80 rounded-full blur-3xl -mr-10 -mb-10" />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              {otpStep ? verifyTitle : 'Join Donte'}
            </h2>
            <p className="text-gray-500 mt-2">{otpStep ? verifyHint : 'Create an account to start funding.'}</p>
          </div>

          {!otpStep && (
            <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
              <button
                type="button"
                onClick={() => setRegisterMode('email')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  registerMode === 'email' ? 'bg-white shadow text-slate-800' : 'text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setRegisterMode('phone')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  registerMode === 'phone' ? 'bg-white shadow text-slate-800' : 'text-gray-600'
                }`}
              >
                Mobile
              </button>
            </div>
          )}

          {!otpStep && registerMode === 'email' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-600 transition-all bg-gray-50 focus:bg-white"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center mt-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-white bg-slate-700 hover:bg-slate-800 font-medium text-lg transition-all ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          {!otpStep && registerMode === 'phone' && (
            <form onSubmit={handleRegisterPhone} className="space-y-5">
              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-lg p-3">
                SMS OTP needs Twilio credentials in <code className="text-xs">server/.env</code>. Or set{' '}
                <code className="text-xs">SMS_LOG_OTP=true</code> to log OTP in the server console for testing.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                  value={phoneData.name}
                  onChange={(e) => setPhoneData({ ...phoneData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                  placeholder="9876543210"
                  value={phoneData.phone}
                  onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                  value={phoneData.password}
                  onChange={(e) => setPhoneData({ ...phoneData, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-800 disabled:opacity-70"
              >
                {loading ? 'Sending OTP...' : 'Send OTP & create account'}
              </button>
            </form>
          )}

          {otpStep && (
            <form
              onSubmit={registerMode === 'email' ? handleVerifyEmail : handleVerifyPhone}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  name="verification-code"
                  required
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`text-sm font-semibold ${
                    canResend ? 'text-slate-700' : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Resend OTP
                </button>
                <span className="text-sm text-gray-500">
                  {resendCooldown > 0 ? `${resendCooldown}s` : ''}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-700 text-white font-semibold disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}

          {!otpStep && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-700 hover:text-slate-600">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
