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
    const { name, email, password } = req.body;

    console.log("REGISTER BODY:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
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
        "UPDATE users SET name=$1, password_hash=$2, otp=$3, otp_expires_at=$4 WHERE email=$5",
        [name, password_hash, otp, otp_expires_at, email]
      );
    } else {
      await db.query(
        "INSERT INTO users (name, email, password_hash, is_active, otp, otp_expires_at) VALUES ($1,$2,$3,false,$4,$5)",
        [name, email, password_hash, otp, otp_expires_at]
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

    if (!user.password_hash) {
      return res.status(500).json({ message: "password_hash missing in DB" });
    }

    const bcrypt = require("bcrypt");
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login success",
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
const forgotPassword = async (req, res) => res.json({ message: "Forgot temp" });
const resetPassword = async (req, res) => res.json({ message: "Reset temp" });
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