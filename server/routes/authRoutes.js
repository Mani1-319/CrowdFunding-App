const express = require('express');
const {
  registerUser,
  verifyOtp,
  loginUser,
  loginAdmin,
  initAdmin,
  getMe,
  forgotPassword,
  resetPassword,
  registerPhone,
  verifyPhoneSignup,
  sendPhoneLoginOtp,
  loginWithPhoneOtp,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register-phone', registerPhone);
router.post('/verify-phone', verifyPhoneSignup);
router.post('/phone/send-login-otp', sendPhoneLoginOtp);
router.post('/phone/login-otp', loginWithPhoneOtp);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.post('/init-admin', initAdmin);
router.get('/me', authMiddleware, getMe);

module.exports = router;
