const express  = require('express');
const router   = express.Router();
const sql      = require('mssql');
const { pool } = require('../db');
const { authenticate, isAdminOrStaff } = require('../authMiddleware');

// helper parse int
const toInt = v => {
  const n = parseInt(v, 10);
  return isNaN(n) ? NaN : n;
};

/**
 * 1) GET /api/products
 *    - Lấy danh sách sản phẩm công khai
 */
router.get('/', async (_req, res) => {
  try {
    const rs = await pool.request()
      .query(`
        SELECT
          Id AS id,
          Name AS name,
          Price AS price,
          ImageUrl AS imageUrl
        FROM Products
        ORDER BY Id DESC
      `);
    res.json(rs.recordset);
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
  }
});

/**
 * 2) GET /api/products/history
 *    - Lấy lịch sử chỉnh sửa (Admin/Staff)
 */
router.get('/history', authenticate, isAdminOrStaff, async (_req, res) => {
  try {
    const rs = await pool.request()
      .query(`
        SELECT
          h.id,
          h.productId   AS sp,
          h.productName AS productName,
          u.username    AS [user],
          h.action      AS action,
          h.modifiedAt  AS at
        FROM ProductHistory h
        LEFT JOIN Users u
          ON u.id = h.userID
        ORDER BY h.modifiedAt DESC
      `);
    res.json(rs.recordset);
  } catch (err) {
    console.error('GET /api/products/history error:', err);
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử chỉnh sửa', detail: err.message });
  }
});

/**
 * 3) GET /api/products/:id
 *    - Lấy chi tiết sản phẩm (Admin/Staff)
 */
router.get('/:id', authenticate, isAdminOrStaff, async (req, res) => {
  const id = toInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  try {
    const rs = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          Id AS id,
          Name AS name,
          Price AS price,
          ImageUrl AS imageUrl
        FROM Products
        WHERE Id = @id
      `);
    if (!rs.recordset.length) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(rs.recordset[0]);
  } catch (err) {
    console.error(`GET /api/products/${id} error:`, err);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết sản phẩm' });
  }
});

/**
 * 4) POST /api/products
 *    - Tạo mới sản phẩm (Admin/Staff)
 */
router.post('/', authenticate, isAdminOrStaff, async (req, res) => {
  const { name, price, imageUrl = '' } = req.body;
  if (!name || price == null || price <= 0) {
    return res.status(400).json({ message: 'Tên và giá không hợp lệ' });
  }

  try {
    // 1) Thêm sản phẩm
    const ins = await pool.request()
      .input('name',     sql.NVarChar,    name)
      .input('price',    sql.Decimal(18,2), price)
      .input('imageUrl', sql.NVarChar,    imageUrl)
      .query(`
        INSERT INTO Products (Name, Price, ImageUrl)
        OUTPUT INSERTED.Id
        VALUES (@name, @price, @imageUrl)
      `);
    const newId = ins.recordset[0].Id;

    // 2) Trả về client trước
    res.status(201).json({ id: newId });

    // 3) Log lịch sử tạo
    try {
      await pool.request()
        .input('productId',   sql.Int,       newId)
        .input('productName', sql.NVarChar,  name)
        .input('action',      sql.NVarChar,  'created')
        .input('userID',      sql.Int,       req.user.id)
        .query(`
          INSERT INTO ProductHistory
            (productId, productName, action, userID)
          VALUES
            (@productId, @productName, @action, @userID)
        `);
    } catch (logErr) {
      console.error('Lỗi khi ghi history CREATE:', logErr);
    }

  } catch (err) {
    console.error('POST /api/products error:', err);
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', detail: err.message });
  }
});

/**
 * 5) PUT /api/products/:id
 *    - Cập nhật sản phẩm (Admin/Staff)
 */
router.put('/:id', authenticate, isAdminOrStaff, async (req, res) => {
  const id = toInt(req.params.id);
  const { name, price, imageUrl = '' } = req.body;
  if (isNaN(id) || !name || price == null || price <= 0) {
    return res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ' });
  }

  try {
    // 1) Cập nhật chính
    const upd = await pool.request()
      .input('id',       sql.Int,       id)
      .input('name',     sql.NVarChar,  name)
      .input('price',    sql.Decimal(18,2), price)
      .input('imageUrl', sql.NVarChar,  imageUrl)
      .query(`
        UPDATE Products
        SET Name = @name, Price = @price, ImageUrl = @imageUrl
        WHERE Id = @id
      `);
    if (upd.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    // 2) Trả về
    res.json({ message: 'Cập nhật thành công' });

    // 3) Log lịch sử cập nhật
    try {
      await pool.request()
        .input('productId',   sql.Int,       id)
        .input('productName', sql.NVarChar,  name)
        .input('action',      sql.NVarChar,  'updated')
        .input('userID',      sql.Int,       req.user.id)
        .query(`
          INSERT INTO ProductHistory
            (productId, productName, action, userID)
          VALUES
            (@productId, @productName, @action, @userID)
        `);
    } catch (logErr) {
      console.error('Lỗi khi ghi history UPDATE:', logErr);
    }

  } catch (err) {
    console.error(`PUT /api/products/${id} error:`, err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', detail: err.message });
    }
  }
});

/**
 * 6) DELETE /api/products/:id
 *    - Xóa sản phẩm và log history (Admin/Staff)
 */
router.delete('/:id', authenticate, isAdminOrStaff, async (req, res) => {
  const id = toInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  try {
    // 1) Lấy tên sản phẩm trước khi xóa
    const prod = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Name FROM Products WHERE Id = @id');
    const name = prod.recordset[0]?.Name || '';

    // 2) Xóa bảng con OrderDetails
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM OrderDetails WHERE ProductId = @id');

    // 3) Xóa chính Products
    const del = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Products WHERE Id = @id');
    if (del.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

    // 4) Trả về
    res.json({ message: 'Xóa thành công' });

    // 5) Log lịch sử xóa
    try {
      await pool.request()
        .input('productId',   sql.Int,       id)
        .input('productName', sql.NVarChar,  name)
        .input('action',      sql.NVarChar,  'deleted')
        .input('userID',      sql.Int,       req.user.id)
        .query(`
          INSERT INTO ProductHistory
            (productId, productName, action, userID)
          VALUES
            (@productId, @productName, @action, @userID)
        `);
    } catch (logErr) {
      console.error('Lỗi khi ghi history DELETE:', logErr);
    }

  } catch (err) {
    console.error(`DELETE /api/products/${id} error:`, err);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', detail: err.message });
  }
});

module.exports = router;
