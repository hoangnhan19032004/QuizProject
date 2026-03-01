// =============================================
// AUTH ROUTES — PRODUCTION READY
// Node.js + Express + SQL Server + JWT + ROLE
// =============================================

require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const sql = require('mssql');

const { pool } = require('../db');
const { authenticate } = require('../authMiddleware');

const router = express.Router();


// =============================================
// MULTER CONFIG (UPLOAD AVATAR)
// =============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only images allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});


// =============================================
// REGISTER
// =============================================

router.post('/register', async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Missing username, email or password'
      });
    }

    email = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const p = await pool;

    await p.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'user')
      .query(`
        INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
        VALUES (@username, @email, @password, @role, GETDATE())
      `);

    res.status(201).json({
      message: '✅ User registered successfully'
    });

  } catch (err) {

    if (err.number === 2627) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// =============================================
// LOGIN
// =============================================

router.post('/login', async (req, res) => {
  try {

    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing email or password'
      });
    }

    email = email.toLowerCase().trim();

    const p = await pool;

    const result = await p.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT Id, Email, PasswordHash, Avatar, Role
        FROM Users
        WHERE Email = @email
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: 'Sai tài khoản hoặc mật khẩu'
      });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Sai tài khoản hoặc mật khẩu'
      });
    }

    // 🔥 TOKEN CHỨA ROLE
    const token = jwt.sign(
      {
        id: user.Id,
        email: user.Email,
        role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login success',
      token,
      user: {
        id: user.Id,
        email: user.Email,
        avatar: user.Avatar,
        role: user.Role
      }
    });

  } catch (err) {

    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// =============================================
// GET PROFILE (PROTECTED)
// =============================================

router.get('/profile', authenticate, async (req, res) => {
  try {

    const p = await pool;

    const result = await p.request()
      .input('id', sql.Int, req.user.id)
      .query(`
        SELECT Id, Email, Avatar, Role, CreatedAt
        FROM Users
        WHERE Id = @id
      `);

    res.json(result.recordset[0]);

  } catch (err) {

    console.error("PROFILE ERROR:", err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// =============================================
// UPDATE AVATAR
// =============================================

router.put(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      const p = await pool;

      await p.request()
        .input('id', sql.Int, req.user.id)
        .input('avatar', sql.NVarChar, avatarPath)
        .query(`
          UPDATE Users
          SET Avatar = @avatar
          WHERE Id = @id
        `);

      res.json({
        message: '✅ Avatar updated',
        avatar: avatarPath
      });

    } catch (err) {

      console.error("AVATAR ERROR:", err);

      res.status(500).json({
        message: 'Server error'
      });
    }
  }
);

module.exports = router;