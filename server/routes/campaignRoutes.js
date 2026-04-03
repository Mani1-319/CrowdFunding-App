const express = require('express');
const { createCampaign, getCampaigns, getCampaignById, updateCampaign, deleteCampaign, endCampaign, getAllCampaigns, getUserCampaigns, approveCampaign } = require('../controllers/campaignController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Explicit path routes must be placed ABOVE parameter variables like /:id
router.get('/all', authMiddleware, adminMiddleware, getAllCampaigns);
router.get('/user/me', authMiddleware, getUserCampaigns);

// Public routes
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);

// Protected routes (User)
router.post('/', authMiddleware, upload.array('images', 5), createCampaign);
router.put('/:id', authMiddleware, updateCampaign);
router.delete('/:id', authMiddleware, deleteCampaign);
router.post('/:id/end', authMiddleware, endCampaign);

// Protected routes (Admin)
router.put('/:id/approve', authMiddleware, adminMiddleware, approveCampaign);

module.exports = router;
