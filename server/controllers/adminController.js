const db = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, name, email, is_active, is_suspended
       FROM users
       ORDER BY id DESC`
    );
    res.json(users.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const suspendUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.query('SELECT is_suspended FROM users WHERE id=$1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const newStatus = !user.rows[0].is_suspended;
    await db.query('UPDATE users SET is_suspended=$1 WHERE id=$2', [newStatus, id]);
    res.json({ message: `User successfully ${newStatus ? 'suspended' : 'unsuspended'}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend user' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete user (cascade will handle related tables if configured, otherwise we delete carefully)
    await db.query('DELETE FROM donations WHERE user_id=$1', [id]);
    await db.query('DELETE FROM campaigns WHERE user_id=$1', [id]);
    await db.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
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

module.exports = { getAllUsers, getAllDonations, suspendUser, deleteUser };

