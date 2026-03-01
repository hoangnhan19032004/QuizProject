// routes/staffRoutes.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authenticate, isAdmin } = require('../authMiddleware');

// GET /api/staff
// → Cho mọi user đã login (authenticate) xem danh sách staff
router.get('/', authenticate, async (req, res) => {
  try {
    const rs = await pool.request()
      .query(`
        SELECT 
          id,
          username AS name,
          email,
          phone
        FROM Users
        WHERE role = 'staff'
        ORDER BY id DESC
      `);
    res.json(rs.recordset);
  } catch (err) {
    console.error('GET /api/staff error:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên' });
  }
});

// POST /api/staff      → chỉ admin mới thêm
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { username, email, password, phone } = req.body;
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
  }
  try {
    const dup = await pool.request()
      .input('email', email.toLowerCase())
      .query(`SELECT 1 FROM Users WHERE LOWER(email)=@email`);
    if (dup.recordset.length) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.request()
      .input('username', username)
      .input('email', email)
      .input('password', hash)
      .input('phone', phone)
      .input('role', 'staff')
      .query(`
        INSERT INTO Users (username,email,password,phone,role,createdAt)
        VALUES (@username,@email,@password,@phone,@role,GETDATE())
      `);
    res.status(201).json({ message: 'Đã thêm nhân viên' });
  } catch (err) {
    console.error('POST /api/staff error:', err);
    res.status(500).json({ message: 'Lỗi khi tạo nhân viên' });
  }
});

// PUT /api/staff/:id   → chỉ admin mới sửa
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { username, email, phone, password } = req.body;
  if (!id) return res.status(400).json({ message: 'ID không hợp lệ' });
  const fields = [];
  const rq = pool.request().input('id', id);

  if (username) {
    fields.push('username=@username');
    rq.input('username', username);
  }
  if (email) {
    fields.push('email=@email');
    rq.input('email', email);
  }
  if (phone) {
    fields.push('phone=@phone');
    rq.input('phone', phone);
  }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    fields.push('password=@password');
    rq.input('password', hash);
  }
  if (!fields.length) {
    return res.status(400).json({ message: 'Không có trường để cập nhật' });
  }

  try {
    const rs = await rq.query(`
      UPDATE Users 
      SET ${fields.join(', ')}
      WHERE id=@id AND role='staff'
    `);
    if (rs.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('PUT /api/staff/:id error:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật nhân viên' });
  }
});

// DELETE /api/staff/:id → chỉ admin mới xóa
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID không hợp lệ' });
  try {
    const rs = await pool.request()
      .input('id', id)
      .query(`DELETE FROM Users WHERE id=@id AND role='staff'`);
    if (rs.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error('DELETE /api/staff/:id error:', err);
    res.status(500).json({ message: 'Lỗi khi xóa nhân viên' });
  }
});
// GET /api/staff/:id → lấy chi tiết nhân viên (chỉ admin mới được)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }
  try {
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT 
          id,
          username AS name,
          email,
          phone
        FROM Users
        WHERE id = @id AND role = 'staff'
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    // trả về đúng object { id, name, email, phone }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('GET /api/staff/:id error:', err);
    res.status(500).json({ message: 'Lỗi khi tải thông tin nhân viên' });
  }
});

module.exports = router;
