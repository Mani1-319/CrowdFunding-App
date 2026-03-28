const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');

const createCampaign = async (req, res) => {
  const { title, description, goal_amount, deadline } = req.body;
  const user_id = req.user.id;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const newCampaign = await db.query(
      'INSERT INTO campaigns (user_id, title, description, goal_amount, deadline, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, title, description, goal_amount, deadline, image_url]
    );

    res.status(201).json(newCampaign.rows[0]);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Server error while creating campaign' });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT c.*, u.name as creator_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.status = 'approved'
      ORDER BY c.created_at DESC
    `);
    res.json(campaigns.rows);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
};

const getCampaignById = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await db.query(`
      SELECT c.*, u.name as creator_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (campaign.rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign.rows[0]);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Server error while fetching campaign' });
  }
};

// Admin: fetch all campaigns (regardless of approval status)
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT c.*, u.name as creator_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(campaigns.rows);
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
};

// User: fetch only the campaigns created by the authenticated user
const getUserCampaigns = async (req, res) => {
  const user_id = req.user.id;
  try {
    const campaigns = await db.query(`
      SELECT c.*, u.name as creator_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [user_id]);
    res.json(campaigns.rows);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
};

// Admin: approve a pending campaign
const approveCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCampaign = await db.query(
      `UPDATE campaigns
       SET status = 'approved'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (updatedCampaign.rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(updatedCampaign.rows[0]);
  } catch (error) {
    console.error('Error approving campaign:', error);
    res.status(500).json({ message: 'Server error while approving campaign' });
  }
};

const updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { title, description, goal_amount, deadline } = req.body;
  const user_id = req.user.id;

  try {
    // Check ownership
    const campaignCheck = await db.query('SELECT user_id FROM campaigns WHERE id = $1', [id]);
    if (campaignCheck.rows.length === 0) return res.status(404).json({ message: 'Campaign not found' });
    
    if (campaignCheck.rows[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this campaign' });
    }

    const updatedCampaign = await db.query(
      'UPDATE campaigns SET title = COALESCE($1, title), description = COALESCE($2, description), goal_amount = COALESCE($3, goal_amount), deadline = COALESCE($4, deadline) WHERE id = $5 RETURNING *',
      [title, description, goal_amount, deadline, id]
    );

    res.json(updatedCampaign.rows[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Server error while updating campaign' });
  }
};

const deleteCampaign = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const campaignCheck = await db.query('SELECT user_id FROM campaigns WHERE id = $1', [id]);
    if (campaignCheck.rows.length === 0) return res.status(404).json({ message: 'Campaign not found' });

    if (campaignCheck.rows[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this campaign' });
    }

    await db.query('DELETE FROM campaigns WHERE id = $1', [id]);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Server error while deleting campaign' });
  }
};

const endCampaign = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const campaignCheck = await db.query('SELECT * FROM campaigns WHERE id = $1', [id]);
    if (campaignCheck.rows.length === 0) return res.status(404).json({ message: 'Campaign not found' });
    
    const campaign = campaignCheck.rows[0];

    if (campaign.user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to end this campaign' });
    }

    const userCheck = await db.query('SELECT email, name FROM users WHERE id = $1', [campaign.user_id]);
    const creator = userCheck.rows[0];

    // Get all successful donations for this campaign
    const donations = await db.query(`
      SELECT d.amount, u.name as donor_name, u.email as donor_email
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = $1 AND d.status = 'successful'
      ORDER BY d.created_at DESC
    `, [id]);

    // Send email to creator
    let donorRows = '';
    donations.rows.forEach(d => {
      donorRows += `<tr><td>${d.donor_name || 'Anonymous'}</td><td>${d.donor_email || 'N/A'}</td><td>₹${d.amount}</td></tr>`;
    });

    const htmlBody = `
      <h2>Campaign Completion Report</h2>
      <p>Dear ${creator.name},</p>
      <p>Congratulations, your campaign "<b>${campaign.title}</b>" has ended.</p>
      <h3>Summary</h3>
      <ul>
        <li>Goal: ₹${campaign.goal_amount}</li>
        <li>Raised: ₹${campaign.raised_amount}</li>
        <li>Total Donations: ${donations.rows.length}</li>
      </ul>
      <h3>Donor List</h3>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr><th>Donor Name</th><th>Donor Email</th><th>Amount</th></tr>
        ${donorRows}
      </table>
      <p>Thank you for using our platform.</p>
    `;

    const emailResult = await sendEmail(creator.email, `Campaign Completion Report: ${campaign.title}`, htmlBody);
    if (!emailResult.ok) {
      console.error('Campaign report email failed:', emailResult.error);
    }

    res.json({
      message: emailResult.ok
        ? 'Campaign ended and summary report emailed successfully.'
        : 'Campaign ended, but the summary email could not be sent. Check SMTP settings.',
    });
  } catch (error) {
    console.error('Error ending campaign:', error);
    res.status(500).json({ message: 'Error ending campaign' });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  getAllCampaigns,
  getUserCampaigns,
  updateCampaign,
  deleteCampaign,
  endCampaign,
  approveCampaign,
};
