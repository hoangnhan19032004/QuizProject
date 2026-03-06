const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { pool } = require("../db");
const { authenticate, isAdmin } = require("../authMiddleware");

/* ================= USERS ================= */

// Lấy danh sách user
router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {

    const result = await pool.request().query(`
      SELECT Id, Username, Role, IsActive, CreatedAt
      FROM Users
      ORDER BY CreatedAt DESC
    `);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ================= UPDATE USER ================= */

router.put("/users/:id", authenticate, isAdmin, async (req, res) => {

  const { id } = req.params;
  const { Username, Role, IsActive } = req.body;

  try {

    await pool.request()
      .input("Id", sql.Int, id)
      .input("Username", sql.NVarChar, Username)
      .input("Role", sql.NVarChar, Role)
      .input("IsActive", sql.Bit, IsActive)
      .query(`
        UPDATE Users
        SET Username = @Username,
            Role = @Role,
            IsActive = @IsActive
        WHERE Id = @Id
      `);

    res.json({ message: "User updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


/* ================= DELETE USER ================= */

router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {

  const { id } = req.params;

  try {

    await pool.request()
      .input("Id", sql.Int, id)
      .query(`DELETE FROM Users WHERE Id = @Id`);

    res.json({ message: "User deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


/* ================= SUBMISSIONS ================= */

// Lấy tất cả bài làm
router.get("/submissions", authenticate, isAdmin, async (req, res) => {

  try {

    const result = await pool.request().query(`
      SELECT s.Id,
             u.Username,
             s.Score,
             s.SubmittedAt
      FROM Submissions s
      JOIN Users u ON s.UserId = u.Id
      ORDER BY s.SubmittedAt DESC
    `);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


// Xem chi tiết bài làm
router.get("/submissions/:id", authenticate, isAdmin, async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.request()
      .input("SubmissionId", sql.Int, id)
      .query(`
        SELECT q.QuestionText,
               a.AnswerText,
               sa.IsCorrect
        FROM SubmissionAnswers sa
        JOIN Questions q ON sa.QuestionId = q.Id
        JOIN Answers a ON sa.SelectedAnswerId = a.Id
        WHERE sa.SubmissionId = @SubmissionId
      `);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


module.exports = router;