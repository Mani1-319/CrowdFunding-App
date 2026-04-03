const express = require('express');
const { createOrder, verifyPayment, getDonationsByCampaign, getUserDonations } = require('../controllers/donationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', createOrder);
// Optional auth for donations, so people can donate anonymously if they want. If auth is strictly required, we can apply authMiddleware but verifyPayment checks internally.
// But to ensure req.user exists if token is sent:
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization');
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || "secret123");
    } catch(e) {}
  }
  next();
};

router.post('/verify', optionalAuth, verifyPayment);
router.get('/campaign/:id', getDonationsByCampaign);
router.get('/user/me', authMiddleware, getUserDonations);

module.exports = router;
