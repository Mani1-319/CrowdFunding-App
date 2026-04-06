const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');

const createOrder = async (req, res) => {
  const { amount, campaign_id } = req.body;
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID === 'rzp_test_dummykey') {
    return res.json({ 
      order: { id: 'mock_order_' + Date.now(), amount: Math.round(amount * 100), currency: "INR" }, 
      campaign_id 
    });
  }

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");

    res.json({ order, campaign_id });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, campaign_id } = req.body;
  const user_id = req.user ? req.user.id : null; // Can be anonymous donation
  const cid = Number(campaign_id);
  const amt = parseFloat(amount);

  if (!Number.isFinite(cid) || cid <= 0) {
    return res.status(400).json({ message: 'Invalid campaign' });
  }
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    let isAuthentic = false;
    
    // Check if this is a simulated payment from the local testing flow
    if (razorpay_signature === 'mock_signature') {
      isAuthentic = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
      // Payment is successful
      // 1. Insert into donations
      await db.query(
        'INSERT INTO donations (campaign_id, user_id, amount, payment_id, status) VALUES ($1, $2, $3, $4, $5)',
        [cid, user_id, amt, razorpay_payment_id, 'successful']
      );

      // 2. Update campaign raised_amount
      const updatedCampaign = await db.query(
        'UPDATE campaigns SET raised_amount = raised_amount + $1 WHERE id = $2 RETURNING *',
        [amt, cid]
      );

      const campaign = updatedCampaign.rows[0];
      const raised = parseFloat(campaign.raised_amount);
      const goal = parseFloat(campaign.goal_amount);

      // 3. Send email if goal just reached
      if (raised >= goal && (raised - amt) < goal) {
        try {
          const userQuery = await db.query('SELECT email, name FROM users WHERE id = $1', [campaign.user_id]);
          const creator = userQuery.rows[0];
          
          if (creator && creator.email) {
            const subject = 'Campaign Successfully Completed! 🎉';
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #4f46e5;">Congratulations!</h2>
                <p>Dear <strong>${creator.name}</strong>,</p>
                <p>We are thrilled to inform you that your campaign <strong>"${campaign.title}"</strong> has successfully reached its goal amount of <strong>₹${goal}</strong>!</p>
                <p>Your total raised amount is now <strong>₹${raised}</strong>.</p>
                <p>This is a great achievement. We request you to create more campaigns and continue making a positive impact.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The Donte Platform Team</strong></p>
              </div>
            `;
            // Call without await so it doesn't block the payment verification response
            sendEmail(creator.email, subject, html).catch(err => console.error('Failed to send goal completion email:', err));
          }
        } catch (emailErr) {
          console.error('Error in sending goal completion email:', emailErr);
        }
      }

      const io = req.app.get('socketio');
      if (io) {
        io.emit('campaign_update', { 
          campaignId: cid,
          raisedAmount: parseFloat(updatedCampaign.rows[0].raised_amount),
        });
      }

      res.status(200).json({ message: 'Payment verified successfully.' });
    } else {
      res.status(400).json({ message: 'Invalid payment signature.' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
};

const getDonationsByCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const donations = await db.query(`
      SELECT d.*, u.name as donor_name
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = $1 AND d.status = 'successful'
      ORDER BY d.created_at DESC
    `, [id]);
    res.json(donations.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations' });
  }
};

const getUserDonations = async (req, res) => {
  try {
    const donations = await db.query(`
      SELECT d.*, c.title as campaign_title 
      FROM donations d 
      JOIN campaigns c ON d.campaign_id = c.id 
      WHERE d.user_id = $1 AND d.status = 'successful'
      ORDER BY d.created_at DESC
    `, [req.user.id]);
    res.json(donations.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user donations' });
  }
};

module.exports = { createOrder, verifyPayment, getDonationsByCampaign, getUserDonations };
