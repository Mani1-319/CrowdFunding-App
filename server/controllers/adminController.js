const db = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, name, email, is_active
       FROM users
       WHERE is_active = true
       ORDER BY id DESC`
    );
    res.json(users.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await db.query(
      `SELECT
         d.id,
         d.campaign_id,
         d.user_id,
         d.amount,
         d.payment_id,
         d.status,
         d.created_at,
         c.title AS campaign_title,
         u.name AS donor_name,
         u.email AS donor_email
       FROM donations d
       JOIN campaigns c ON c.id = d.campaign_id
       LEFT JOIN users u ON u.id = d.user_id
       WHERE d.status = 'successful'
       ORDER BY d.created_at DESC`
    );
    res.json(donations.rows);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
};

module.exports = { getAllUsers, getAllDonations };

