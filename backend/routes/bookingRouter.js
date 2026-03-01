const express = require('express');
const sql     = require('mssql');
const multer  = require('multer');
const path    = require('path');
const { pool }         = require('../db');
const { authenticate, isAdminOrStaff } = require('../authMiddleware');

const router = express.Router();

// --- Cấu hình multer để upload ảnh hoàn thành ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/bookings'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `booking_${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/**
 * POST /api/bookings
 * → Tạo booking mới (user)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber, staffId, dateTime, service } = req.body;
    if (!phoneNumber || !staffId || !dateTime || !service) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt lịch' });
    }
    const dt = new Date(dateTime);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ message: 'Định dạng ngày giờ không hợp lệ' });
    }

    const result = await pool.request()
      .input('userId',      sql.Int,          userId)
      .input('staffId',     sql.Int,          staffId)
      .input('phoneNumber', sql.VarChar(20),  phoneNumber)
      .input('dateTime',    sql.DateTime,     dt)
      .input('service',     sql.NVarChar(100),service)
      .input('status',      sql.NVarChar(20), 'Pending')
      .query(`
        INSERT INTO Bookings
          (userId, staffId, phoneNumber, dateTime, service, status, createdAt, updatedAt)
        VALUES
          (@userId, @staffId, @phoneNumber, @dateTime, @service, @status, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS bookingId;
      `);

    const bookingId = result.recordset[0].bookingId;
    res.status(201).json({ message: 'Đặt lịch thành công', bookingId });
  } catch (err) {
    console.error('❌ Error in POST /api/bookings:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

/**
 * GET /api/bookings
 * → Lấy tất cả booking (ai cũng xem được, không cần login)
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT
          b.id,
          b.dateTime,
          b.service,
          b.status,
          u2.username    AS staffName,
          u1.username    AS customerName,
          b.doneImage    AS doneImage
        FROM Bookings b
        JOIN Users u2 ON u2.id = b.staffId
        JOIN Users u1 ON u1.id = b.userId
        ORDER BY b.dateTime ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error in GET /api/bookings:', err);
    res.status(500).json({ message: 'Lỗi khi lấy lịch đặt' });
  }
});

/**
 * GET /api/bookings/user
 * → Lấy booking của chính user (chỉ user đã login)
 */
router.get('/user', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT
          b.id,
          b.dateTime,
          b.service,
          b.status,
          b.doneImage    AS doneImage,
          u2.username    AS staffName
        FROM Bookings b
        JOIN Users u2 ON u2.id = b.staffId
        WHERE b.userId = @uid
        ORDER BY b.dateTime ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error in GET /api/bookings/user:', err);
    res.status(500).json({ message: 'Lỗi khi lấy lịch của user' });
  }
});

/**
 * POST /api/bookings/:id/upload-image
 * → Admin/Staff upload ảnh hoàn thành
 */
router.post(
  '/:id/upload-image',
  authenticate,
  isAdminOrStaff,
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa có file được gửi lên' });
    }
    const imageUrl = `/uploads/bookings/${req.file.filename}`;
    try {
      await pool.request()
        .input('id',        sql.Int,          parseInt(req.params.id, 10))
        .input('doneImage', sql.NVarChar(255), imageUrl)
        .query(`
          UPDATE Bookings
          SET doneImage = @doneImage, updatedAt = GETDATE()
          WHERE id = @id
        `);
      res.json({ message: 'Upload ảnh thành công', imageUrl });
    } catch (err) {
      console.error('❌ Error in POST /api/bookings/:id/upload-image:', err);
      res.status(500).json({ message: 'Lỗi khi lưu ảnh' });
    }
  }
);
// trong routes/bookingRouter.js, trước các PATCH...
router.get('/:id', authenticate, isAdminOrStaff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT b.*, u1.username AS customerName, u2.username AS staffName
        FROM Bookings b
        JOIN Users u1 ON u1.id = b.userId
        JOIN Users u2 ON u2.id = b.staffId
        WHERE b.id = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
/**
 * GET /api/bookings/:id
 * → Lấy chi tiết 1 booking
 */
router.get('/:id', authenticate, isAdminOrStaff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          b.id,
          b.phoneNumber    AS phoneNumber,
          b.dateTime,
          b.service,
          b.status,
          b.doneImage      AS doneImage,
          u2.username      AS staffName,
          u1.username      AS customerName
        FROM Bookings b
        JOIN Users u2 ON u2.id = b.staffId
        JOIN Users u1 ON u1.id = b.userId
        WHERE b.id = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết booking' });
  }
});
/**
 * PATCH /api/bookings/:id/status
 * → Admin/Staff cập nhật trạng thái (và hình ảnh nếu có)
 */
router.patch(
  '/:id/status',
  authenticate,
  isAdminOrStaff,
  async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const { status, doneImageUrl } = req.body;

    if (!['Pending','Done','Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    try {
      const result = await pool.request()
        .input('id',        sql.Int,          bookingId)
        .input('status',    sql.NVarChar(20), status)
        .input('doneImage', sql.NVarChar(255), doneImageUrl || null)
        .query(`
          UPDATE Bookings
          SET status    = @status,
              doneImage = @doneImage,
              updatedAt = GETDATE()
          WHERE id = @id
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Không tìm thấy booking' });
      }
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
      console.error('❌ Error in PATCH /api/bookings/:id/status:', err);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái' });
    }
  }
);

module.exports = router;
