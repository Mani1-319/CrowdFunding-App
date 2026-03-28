const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');
const { sendSmsOtp, normalizePhoneDigits } = require('../utils/smsService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
const syntheticEmailFromPhone = (digits) => `phone_${digits}@users.donte.local`;

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers' });
  }

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      if (userCheck.rows[0].is_active) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Regenerate OTP for unverified user
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 10 * 60000); // 10 mins expiry
      
      await db.query(
        'UPDATE users SET name = $1, password_hash = $2, otp = $3, otp_expires_at = $4 WHERE email = $5',
        [name, password_hash, otp, otp_expires_at, email]
      );

      const emailResult = await sendEmail(
        email,
        'Verify Your Account',
        `<p>Your verification OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
      );

      if (!emailResult.ok) {
        console.error('OTP email (resend) failed for', email, emailResult.error);
      }

      return res.status(200).json({
        message: emailResult.ok
          ? 'OTP resent successfully. Please check your email inbox (and spam).'
          : 'OTP could not be emailed. Fix SMTP in server/.env, then use Resend OTP.',
        userId: userCheck.rows[0].id,
        emailSent: emailResult.ok,
        emailError: emailResult.ok ? undefined : emailResult.error,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60000); // 10 mins expiry

    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash, otp, otp_expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email',
      [name, email, password_hash, otp, otp_expires_at]
    );

    const emailResult = await sendEmail(
      email,
      'Verify Your Account',
      `<p>Your verification OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    );

    if (!emailResult.ok) {
      console.error('OTP email (register) failed for', email, emailResult.error);
    }

    res.status(201).json({
      message: emailResult.ok
        ? 'We sent a verification code to your email. Please check your inbox (and spam folder).'
        : 'Account created, but the OTP email could not be sent. Check server/.env SMTP settings and use Resend OTP after fixing.',
      userId: newUser.rows[0].id,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.error,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ message: 'User not found' });
    
    const user = userResult.rows[0];

    if (user.is_active) return res.status(400).json({ message: 'User is already verified' });

    if (user.otp !== otp || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await db.query('UPDATE users SET is_active = true, otp = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);

    res.status(200).json({ message: 'Account verified successfully. You can now login.' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(400).json({ message: 'Please verify your email via OTP first' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    const emailOut =
      user.email && String(user.email).endsWith('@users.donte.local') ? null : user.email;

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: emailOut,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Admin Auth
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminResult = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (adminResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const admin = adminResult.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin.id, 'admin');

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

const initAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await db.query('INSERT INTO admins (email, password_hash) VALUES ($1, $2)', [email, hash]);
    }
    res.status(200).json({ message: 'Admin ready' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing admin' });
  }
};

const getMe = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole === 'admin') {
      const admin = await db.query('SELECT id, email FROM admins WHERE id = $1', [req.user.id]);
      if (admin.rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
      return res.json({ id: admin.rows[0].id, email: admin.rows[0].email, role: 'admin' });
    } else {
      const user = await db.query(
        'SELECT id, name, email, is_active, phone FROM users WHERE id = $1',
        [req.user.id]
      );
      if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });
      const row = user.rows[0];
      const emailOut =
        row.email && String(row.email).endsWith('@users.donte.local') ? null : row.email;
      return res.json({
        id: row.id,
        name: row.name,
        email: emailOut,
        phone: row.phone,
        is_active: row.is_active,
        role: 'user',
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const r = await db.query('SELECT id, email, name FROM users WHERE email = $1', [email]);
    if (r.rows.length === 0) {
      return res.json({
        message: 'If an account exists for this email, you will receive a reset code shortly.',
        emailSent: true,
      });
    }
    if (r.rows[0].email && String(r.rows[0].email).endsWith('@users.donte.local')) {
      return res.status(400).json({
        message: 'This account uses mobile sign-up. Reset password via phone OTP or contact support.',
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const exp = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      'UPDATE users SET reset_password_otp = $1, reset_password_expires_at = $2 WHERE id = $3',
      [otp, exp, r.rows[0].id]
    );
    const emailResult = await sendEmail(
      email,
      'Reset your Donte password',
      `<p>Hi ${r.rows[0].name || ''},</p><p>Your password reset code is <b>${otp}</b>. It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`
    );
    return res.json({
      message: emailResult.ok
        ? 'Check your email for the reset code.'
        : 'Could not send email. Check SMTP settings on the server.',
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.error,
    });
  } catch (e) {
    console.error('forgotPassword', e);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include letters and numbers',
    });
  }
  try {
    const r = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (r.rows.length === 0) return res.status(400).json({ message: 'Invalid request' });
    const u = r.rows[0];
    if (
      u.reset_password_otp !== otp ||
      !u.reset_password_expires_at ||
      new Date() > new Date(u.reset_password_expires_at)
    ) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await db.query(
      'UPDATE users SET password_hash = $1, reset_password_otp = NULL, reset_password_expires_at = NULL WHERE id = $2',
      [password_hash, u.id]
    );
    res.json({ message: 'Password updated. You can log in now.' });
  } catch (e) {
    console.error('resetPassword', e);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerPhone = async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'Name, phone, and password are required' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include letters and numbers',
    });
  }
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 10) {
    return res.status(400).json({ message: 'Enter a valid mobile number' });
  }
  const syntheticEmail = syntheticEmailFromPhone(digits);
  try {
    const existing = await db.query('SELECT * FROM users WHERE phone = $1 OR email = $2', [
      digits,
      syntheticEmail,
    ]);
    if (existing.rows.length > 0) {
      const u = existing.rows[0];
      if (u.is_active && u.phone_verified) {
        return res.status(400).json({ message: 'This number is already registered. Log in with phone OTP.' });
      }
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const exp = new Date(Date.now() + 10 * 60 * 1000);
      await db.query(
        `UPDATE users SET name = $1, password_hash = $2, phone_otp = $3, phone_otp_expires_at = $4
         WHERE id = $5`,
        [name, password_hash, otp, exp, u.id]
      );
      const sms = await sendSmsOtp(digits, otp);
      return res.status(200).json({
        message: sms.ok
          ? 'OTP sent to your mobile number.'
          : 'Could not send SMS. Configure Twilio in server/.env (see .env.example).',
        smsSent: sms.ok,
        smsError: sms.error,
        userId: u.id,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const exp = new Date(Date.now() + 10 * 60 * 1000);
    const ins = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, phone_otp, phone_otp_expires_at, is_active, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, false, false) RETURNING id`,
      [name, syntheticEmail, password_hash, digits, otp, exp]
    );
    const sms = await sendSmsOtp(digits, otp);
    res.status(201).json({
      message: sms.ok
        ? 'OTP sent to your mobile number.'
        : 'Account created but SMS could not be sent. Configure Twilio or set SMS_LOG_OTP=true for dev.',
      smsSent: sms.ok,
      smsError: sms.error,
      userId: ins.rows[0].id,
    });
  } catch (e) {
    console.error('registerPhone', e);
    if (e.code === '23505') {
      return res.status(400).json({ message: 'This phone number is already in use' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const verifyPhoneSignup = async (req, res) => {
  const { phone, otp } = req.body;
  const digits = normalizePhoneDigits(phone);
  if (!digits || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });
  try {
    const r = await db.query('SELECT * FROM users WHERE phone = $1', [digits]);
    if (r.rows.length === 0) return res.status(400).json({ message: 'User not found' });
    const u = r.rows[0];
    if (u.phone_verified && u.is_active) {
      return res.status(400).json({ message: 'Already verified. Log in.' });
    }
    if (u.phone_otp !== otp || !u.phone_otp_expires_at || new Date() > new Date(u.phone_otp_expires_at)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    await db.query(
      'UPDATE users SET is_active = true, phone_verified = true, phone_otp = NULL, phone_otp_expires_at = NULL WHERE id = $1',
      [u.id]
    );
    res.json({ message: 'Mobile verified. You can log in.' });
  } catch (e) {
    console.error('verifyPhoneSignup', e);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendPhoneLoginOtp = async (req, res) => {
  const { phone } = req.body;
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 10) return res.status(400).json({ message: 'Invalid phone number' });
  try {
    const r = await db.query(
      'SELECT id FROM users WHERE phone = $1 AND is_active = true AND phone_verified = true',
      [digits]
    );
    if (r.rows.length === 0) {
      return res.status(400).json({ message: 'No account found for this number. Sign up first.' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const exp = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      'UPDATE users SET phone_otp = $1, phone_otp_expires_at = $2 WHERE id = $3',
      [otp, exp, r.rows[0].id]
    );
    const sms = await sendSmsOtp(digits, otp);
    res.json({
      message: sms.ok ? 'OTP sent to your phone.' : 'Could not send SMS. Check Twilio configuration.',
      smsSent: sms.ok,
      smsError: sms.error,
    });
  } catch (e) {
    console.error('sendPhoneLoginOtp', e);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginWithPhoneOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const digits = normalizePhoneDigits(phone);
  if (!digits || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });
  try {
    const r = await db.query('SELECT * FROM users WHERE phone = $1', [digits]);
    if (r.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const u = r.rows[0];
    if (!u.is_active || !u.phone_verified) {
      return res.status(400).json({ message: 'Please complete sign-up verification first' });
    }
    if (u.phone_otp !== otp || !u.phone_otp_expires_at || new Date() > new Date(u.phone_otp_expires_at)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    await db.query(
      'UPDATE users SET phone_otp = NULL, phone_otp_expires_at = NULL WHERE id = $1',
      [u.id]
    );
    const token = generateToken(u.id, u.role || 'user');
    const emailOut = u.email && u.email.endsWith('@users.donte.local') ? null : u.email;
    res.json({
      token,
      user: {
        id: u.id,
        name: u.name,
        email: emailOut,
        phone: u.phone,
        role: u.role || 'user',
      },
    });
  } catch (e) {
    console.error('loginWithPhoneOtp', e);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  loginAdmin,
  initAdmin,
  getMe,
  forgotPassword,
  resetPassword,
  registerPhone,
  verifyPhoneSignup,
  sendPhoneLoginOtp,
  loginWithPhoneOtp,
};
