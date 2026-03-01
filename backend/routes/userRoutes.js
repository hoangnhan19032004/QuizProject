const router = require("express").Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const sql = require("mssql");
const { pool } = require("../db");
const { authenticate, isAdmin } = require("../authMiddleware");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../uploads/avatars")),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `user_${req.user.id}_${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

// ================= ALL ROUTES REQUIRE LOGIN =================
router.use(authenticate);

// ============================================================
// ======================== USER SELF =========================
// ============================================================

// GET /api/users/me
router.get("/me", async (req, res) => {
  try {
    const rs = await pool.request()
      .input("id", sql.Int, req.user.id)
      .query(`
        SELECT id, email, role, username, phone, avatar
        FROM Users
        WHERE id = @id
      `);

    if (!rs.recordset.length) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json(rs.recordset[0]);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /api/users/me
router.put("/me", async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    const updates = [];
    const rq = pool.request().input("id", sql.Int, req.user.id);

    if (username) {
      updates.push("username=@username");
      rq.input("username", sql.NVarChar, username);
    }

    if (email) {
      updates.push("email=@email");
      rq.input("email", sql.NVarChar, email);
    }

    if (phone) {
      updates.push("phone=@phone");
      rq.input("phone", sql.NVarChar, phone);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push("password=@password");
      rq.input("password", sql.NVarChar, hash);
    }

    if (!updates.length) {
      return res.status(400).json({ message: "Không có dữ liệu cập nhật" });
    }

    await rq.query(`
      UPDATE Users
      SET ${updates.join(", ")}, updatedAt = GETDATE()
      WHERE id = @id
    `);

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("PUT /me error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// UPLOAD AVATAR
router.put("/me/avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Chưa upload file" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    await pool.request()
      .input("avatar", sql.NVarChar, avatarPath)
      .input("id", sql.Int, req.user.id)
      .query(`
        UPDATE Users
        SET avatar=@avatar, updatedAt=GETDATE()
        WHERE id=@id
      `);

    res.json({ avatar: avatarPath });

  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ============================================================
// ======================== ADMIN ONLY ========================
// ============================================================

router.use(isAdmin);

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const rs = await pool.request().query(`
      SELECT id, email, role, username, phone, avatar
      FROM Users
      ORDER BY id DESC
    `);

    res.json({ users: rs.recordset });
  } catch (err) {
    console.error("GET users error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// CREATE USER
router.post("/", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hash)
      .input("role", sql.NVarChar, role)
      .query(`
        INSERT INTO Users (email, password, role)
        VALUES (@email, @password, @role)
      `);

    res.json({ message: "Tạo user thành công" });

  } catch (err) {
    console.error("CREATE user error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Users WHERE id=@id`);

    res.json({ message: "Xóa thành công" });

  } catch (err) {
    console.error("DELETE user error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;