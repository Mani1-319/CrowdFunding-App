const express = require('express');
const { addReview, getReviewsByCampaign, flagReview } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Optional auth to extract user id for view logic
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization');
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    } catch(e) {}
  }
  next();
};

router.post('/', authMiddleware, addReview);
router.get('/campaign/:id', optionalAuth, getReviewsByCampaign);
router.put('/:id/flag', authMiddleware, flagReview); // Creator can flag

module.exports = router;
