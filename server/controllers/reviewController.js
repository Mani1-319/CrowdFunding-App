const db = require('../config/db');

const addReview = async (req, res) => {
  const { campaign_id, review_text } = req.body;
  const user_id = req.user.id;

  try {
    const review = await db.query(
      'INSERT INTO reviews (campaign_id, user_id, review_text) VALUES ($1, $2, $3) RETURNING *',
      [campaign_id, user_id, review_text]
    );
    res.status(201).json(review.rows[0]);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error while adding review' });
  }
};

const getReviewsByCampaign = async (req, res) => {
  const { id } = req.params; // campaign id
  const userRole = req.user ? req.user.role : 'guest';
  const userId = req.user ? req.user.id : null;

  try {
    const campaignCheck = await db.query('SELECT user_id FROM campaigns WHERE id = $1', [id]);
    if (campaignCheck.rows.length === 0) return res.status(404).json({ message: 'Campaign not found' });
    
    const isCreator = campaignCheck.rows[0].user_id === userId;
    const isAdmin = userRole === 'admin';

    // According to requirements:
    // Reviews must be visible only to: Campaign creator, The user who posted it
    // Admin should not see private reviews unless flagged (we assume all reviews are private until otherwise)

    let query = `
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.campaign_id = $1
    `;
    const queryParams = [id];

    if (!isCreator) {
      if (isAdmin) {
        query += ` AND r.is_flagged = true`;
      } else if (userId) {
        query += ` AND r.user_id = $2`;
        queryParams.push(userId);
      } else {
        return res.json([]); // Guests see nothing
      }
    }

    query += ` ORDER BY r.created_at DESC`;

    const reviews = await db.query(query, queryParams);
    res.json(reviews.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

const flagReview = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.query('UPDATE reviews SET is_flagged = true WHERE id = $1 RETURNING *', [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error flagging review' });
  }
};

module.exports = { addReview, getReviewsByCampaign, flagReview };
