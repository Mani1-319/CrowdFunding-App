const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", { expiresIn: '1d' });
};

const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, dob, acceptedPrivacy, isAdult } = req.body;

    console.log("REGISTER BODY:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const check = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    let otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    if (check.rows.length > 0) {
      if (check.rows[0].is_active) {
        return res.status(400).json({ message: "User already exists and is active" });
      }
      // UPDATE unverified user
      await db.query(
        "UPDATE users SET name=$1, password_hash=$2, otp=$3, otp_expires_at=$4, phone=$5, address=$6, dob=$7, accepted_privacy=$8, is_adult=$9 WHERE email=$10",
        [name, password_hash, otp, otp_expires_at, phone, address, dob, acceptedPrivacy, isAdult, email]
      );
    } else {
      await db.query(
        "INSERT INTO users (name, email, password_hash, is_active, otp, otp_expires_at, phone, address, dob, accepted_privacy, is_adult) VALUES ($1,$2,$3,false,$4,$5,$6,$7,$8,$9,$10)",
        [name, email, password_hash, otp, otp_expires_at, phone, address, dob, acceptedPrivacy, isAdult]
      );
    }

    const mailRes = await sendEmail(
      email,
      "Verify your Donte account",
      `Your verification code is: <b>${otp}</b>. It expires in 10 minutes.`
    );

    if (mailRes.ok) {
      res.status(200).json({ emailSent: true, message: "OTP sent to your email" });
    } else {
      // For local development, send the OTP anyway if email fails
      res.status(200).json({ 
        emailSent: false, 
        message: "Email disabled. Validating without real email...",
        emailError: mailRes.error,
        otp_demo: otp // Included for demo purposes
      });
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    console.log("DB RESULT:", result.rows);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.is_suspended) {
      return res.status(403).json({ message: "Your account has been suspended for violating platform policies." });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Please verify your email address before logging in. If you lost your OTP, try registering again." });
    }

    if (!user.password_hash) {
      return res.status(500).json({ message: "password_hash missing in DB" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user.id, 'user');

    res.json({
      message: "Login success",
      token: token,
      user: user,
    });

  } catch (err) {
    console.error("LOGIN ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= BASIC STUBS (KEEP SYSTEM WORKING) =================

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: "User not found" });

    const user = result.rows[0];
    if (user.is_active) return res.status(400).json({ message: "Already verified" });

    if (user.otp !== String(otp) || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await db.query("UPDATE users SET is_active=true, otp=NULL, otp_expires_at=NULL WHERE email=$1", [email]);

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM admins WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(admin.id, 'admin');
    res.json({
      message: "Admin login successful",
      token,
      admin: { id: admin.id, email: admin.email, role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const initAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const check = await db.query("SELECT * FROM admins WHERE email=$1", [email]);
    if (check.rows.length > 0) return res.json({ message: "Admin already exists" });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    await db.query("INSERT INTO admins (email, password_hash) VALUES ($1, $2)", [email, password_hash]);
    res.json({ message: "Admin initialized" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getMe = async (req, res) => res.json({ message: "GetMe temp" });
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    let otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.query("UPDATE users SET otp=$1, otp_expires_at=$2 WHERE email=$3", [otp, otp_expires_at, email]);

    const mailRes = await sendEmail(
      email,
      "Donte Password Reset",
      `Your password reset code is: <b>${otp}</b>. It expires in 10 minutes.`
    );

    if (mailRes.ok) {
      res.json({ emailSent: true, message: "Reset code sent to your email" });
    } else {
      res.json({ 
        emailSent: false, 
        message: "Email disabled or failed. Demo mode active.",
        emailError: mailRes.error,
        otp_demo: otp // Included for demo testing 
      });
    }
  } catch (err) {
    console.error("Forgot error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields are required" });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];

    if (user.otp !== String(otp) || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password_hash=$1, otp=NULL, otp_expires_at=NULL WHERE email=$2", [password_hash, email]);

    res.json({ message: "Password updated successfully! You can now log in." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const registerPhone = async (req, res) => res.json({ message: "Phone reg temp" });
const verifyPhoneSignup = async (req, res) => res.json({ message: "Verify phone temp" });
const sendPhoneLoginOtp = async (req, res) => res.json({ message: "Send OTP temp" });
const loginWithPhoneOtp = async (req, res) => res.json({ message: "Login OTP temp" });

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