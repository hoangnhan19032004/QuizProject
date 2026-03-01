// quiz-backend/routes/cartRoutes.js
const express       = require('express');
const router        = express.Router();
const sql           = require('mssql');
const { pool }      = require('../db');
const { authenticate } = require('../authMiddleware');

// GET /api/cart  ← load cart của user hiện tại
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const rs = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT cartJson FROM UserCarts WHERE userId = @userId');
    if (!rs.recordset.length) return res.json([]);
    return res.json(JSON.parse(rs.recordset[0].cartJson));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
  }
});

// PUT /api/cart  ← lưu (upsert) cart của user
router.put('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  const cartJson = JSON.stringify(req.body || []);
  try {
    // kiểm tra đã có bản ghi chưa
    const exists = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT 1 FROM UserCarts WHERE userId = @userId');
    if (exists.recordset.length) {
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('cartJson', sql.NVarChar(sql.MAX), cartJson)
        .query(`
          UPDATE UserCarts
          SET cartJson = @cartJson, updatedAt = GETDATE()
          WHERE userId = @userId
        `);
    } else {
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('cartJson', sql.NVarChar(sql.MAX), cartJson)
        .query(`
          INSERT INTO UserCarts (userId, cartJson)
          VALUES (@userId, @cartJson)
        `);
    }
    res.json({ message: 'Lưu cart thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lưu giỏ hàng' });
  }
});

module.exports = router;
