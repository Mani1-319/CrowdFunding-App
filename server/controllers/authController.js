const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", { expiresIn: '1d' });
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER BODY:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const check = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, is_active) VALUES ($1,$2,$3,true) RETURNING id,name,email",
      [name, email, password_hash]
    );

    res.status(201).json({
      message: "Signup successful",
      user: result.rows[0]
    });

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

const verifyOtp = async (req, res) => res.json({ message: "OTP skipped (temp)" });
const loginAdmin = async (req, res) => res.json({ message: "Admin login temp" });
const initAdmin = async (req, res) => res.json({ message: "Init admin temp" });
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