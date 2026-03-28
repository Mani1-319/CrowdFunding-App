const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getAllUsers, getAllDonations } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/donations', authMiddleware, adminMiddleware, getAllDonations);

module.exports = router;

