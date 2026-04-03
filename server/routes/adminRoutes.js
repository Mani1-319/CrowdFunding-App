const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getAllUsers, getAllDonations, suspendUser, deleteUser } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:id/suspend', authMiddleware, adminMiddleware, suspendUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.get('/donations', authMiddleware, adminMiddleware, getAllDonations);

module.exports = router;

