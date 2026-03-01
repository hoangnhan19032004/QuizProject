// routes/orderRoutes.js
const express = require('express');
const sql     = require('mssql');
const router  = express.Router();
const { pool } = require('../db');
const { authenticate, isAdminOrStaff } = require('../authMiddleware');

/**
 * Helper: tính lại tổng tiền của một order
 */
async function recalcTotal(orderId) {
  const rs = await pool.request()
    .input('oid', sql.Int, orderId)
    .query(`
      SELECT SUM(Quantity * UnitPrice) AS total
      FROM OrderDetails
      WHERE OrderId = @oid
    `);
  const total = rs.recordset[0].total || 0;
  await pool.request()
    .input('oid',   sql.Int,          orderId)
    .input('total', sql.Decimal(18,2), total)
    .query(`
      UPDATE Orders
      SET TotalAmount = @total
      WHERE Id = @oid
    `);
}

/**
 * POST /api/orders
 * Tạo đơn mới (user)
 */
router.post('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, address, city, note, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng đang trống' });
  }

  try {
    // 1) Tạo order
    const ins = await pool.request()
      .input('uid',     sql.Int,      userId)
      .input('name',    sql.NVarChar, name)
      .input('email',   sql.NVarChar, email)
      .input('phone',   sql.NVarChar, phone)
      .input('address', sql.NVarChar, address)
      .input('city',    sql.NVarChar, city)
      .input('note',    sql.NVarChar, note || '')
      .query(`
        INSERT INTO Orders
          (UserId, Name, Email, Phone, Address, City, Note, Status, CreatedAt)
        OUTPUT INSERTED.Id
        VALUES
          (@uid, @name, @email, @phone, @address, @city, @note, 'Pending', GETDATE())
      `);
    const orderId = ins.recordset[0].Id;

    // 2) Tạo chi tiết cho từng item
    for (const it of items) {
      await pool.request()
        .input('oid',   sql.Int,         orderId)
        .input('pid',   sql.Int,         it.id)
        .input('qty',   sql.Int,         it.quantity)
        .input('price', sql.Decimal(18,2), it.price)
        .query(`
          INSERT INTO OrderDetails
            (OrderId, ProductId, Quantity, UnitPrice)
          VALUES
            (@oid, @pid, @qty, @price)
        `);
    }

    // 3) Cập nhật lại tổng tiền
    await recalcTotal(orderId);
    res.status(201).json({ orderId });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', detail: err.message });
  }
});

/**
 * GET /api/orders
 * Lấy đơn hàng hiện tại của user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const rs = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query(`
        SELECT
          o.Id           AS orderId,
          od.ProductId   AS productId,
          p.Name         AS productName,
          od.Quantity    AS quantity,
          o.TotalAmount  AS totalAmount,
          o.Note         AS note,
          o.Status       AS status,
          o.CreatedAt    AS createdAt
        FROM Orders o
        JOIN OrderDetails od ON od.OrderId = o.Id
        JOIN Products      p  ON p.Id      = od.ProductId
        WHERE o.UserId = @uid
        ORDER BY o.CreatedAt DESC
      `);
    res.json(rs.recordset);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng' });
  }
});

/**
 * GET /api/orders/all
 * Lấy tất cả đơn hàng (admin hoặc staff), kèm thông tin khách
 */
router.get('/all', authenticate, isAdminOrStaff, async (req, res) => {
  try {
    const rs = await pool.request()
      .query(`
        SELECT
          o.Id           AS orderId,
          u.username     AS username,
          u.email        AS userEmail,
          u.phone        AS userPhone,
          p.Name         AS productName,
          od.Quantity    AS quantity,
          o.TotalAmount  AS totalAmount,
          o.Note         AS note,
          o.Status       AS status,
          o.CreatedAt    AS createdAt
        FROM Orders o
        JOIN OrderDetails od ON od.OrderId = o.Id
        JOIN Products      p  ON p.Id      = od.ProductId
        JOIN Users         u  ON u.Id      = o.UserId
        ORDER BY o.CreatedAt DESC, o.Id DESC
      `);
    res.json(rs.recordset);
  } catch (err) {
    console.error('GET /api/orders/all error:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', detail: err.message });
  }
});

/**
 * PATCH /api/orders/:id/duyet
 * Duyệt đơn (admin hoặc staff)
 */
router.patch('/:id/duyet', authenticate, isAdminOrStaff, async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  try {
    await pool.request()
      .input('oid', sql.Int, orderId)
      .query(`UPDATE Orders SET Status='Approved' WHERE Id=@oid`);
    res.json({ message: 'Đơn đã được duyệt' });
  } catch (err) {
    console.error('PATCH /api/orders/:id/duyet error:', err);
    res.status(500).json({ message: 'Lỗi khi duyệt đơn' });
  }
});

/**
 * PATCH /api/orders/:id/tuchoi
 * Từ chối đơn (admin hoặc staff)
 */
router.patch('/:id/tuchoi', authenticate, isAdminOrStaff, async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  try {
    await pool.request()
      .input('oid', sql.Int, orderId)
      .query(`UPDATE Orders SET Status='Rejected' WHERE Id=@oid`);
    res.json({ message: 'Đơn đã bị từ chối' });
  } catch (err) {
    console.error('PATCH /api/orders/:id/tuchoi error:', err);
    res.status(500).json({ message: 'Lỗi khi từ chối đơn' });
  }
});

/**
 * PATCH /api/orders/:id/cancel
 * Hủy đơn (user)
 */
router.patch('/:id/cancel', authenticate, async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const userId  = req.user.id;
  try {
    const chk = await pool.request()
      .input('oid', sql.Int, orderId)
      .input('uid', sql.Int, userId)
      .query(`
        SELECT Status
        FROM Orders
        WHERE Id=@oid AND UserId=@uid
      `);
    if (!chk.recordset.length) {
      return res.status(404).json({ message: 'Đơn không tồn tại' });
    }
    if (chk.recordset[0].Status !== 'Pending') {
      return res.status(400).json({ message: 'Chỉ hủy đơn đang chờ duyệt' });
    }
    await pool.request()
      .input('oid', sql.Int, orderId)
      .query(`UPDATE Orders SET Status='Cancelled' WHERE Id=@oid`);
    res.json({ message: 'Hủy đơn thành công' });
  } catch (err) {
    console.error('PATCH /api/orders/:id/cancel error:', err);
    res.status(500).json({ message: 'Lỗi khi hủy đơn' });
  }
});

/**
 * GET /api/orders/:id
 * Chi tiết đơn (admin hoặc staff)
 */
router.get('/:id', authenticate, isAdminOrStaff, async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  try {
    // Thông tin chung
    const rsOrder = await pool.request()
      .input('oid', sql.Int, orderId)
      .query(`
        SELECT
          o.Id           AS orderId,
          u.username     AS username,
          o.TotalAmount  AS totalAmount,
          o.Note         AS note,
          o.Status       AS status,
          o.CreatedAt    AS createdAt
        FROM Orders o
        JOIN Users u ON u.Id = o.UserId
        WHERE o.Id = @oid
      `);
    if (rsOrder.recordset.length === 0) {
      return res.status(404).json({ message: 'Đơn không tồn tại' });
    }
    const order = rsOrder.recordset[0];

    // Chi tiết sản phẩm
    const rsItems = await pool.request()
      .input('oid', sql.Int, orderId)
      .query(`
        SELECT
          od.ProductId,
          p.Name       AS productName,
          od.Quantity
        FROM OrderDetails od
        JOIN Products p ON p.Id = od.ProductId
        WHERE od.OrderId = @oid
      `);
    order.items = rsItems.recordset;

    res.json(order);
  } catch (err) {
    console.error('GET /api/orders/:id error:', err);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn' });
  }
});

module.exports = router;
