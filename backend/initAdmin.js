const sql = require("mssql");
const bcrypt = require("bcrypt");
const config = require("./dbConfig");

async function initAdmin() {
  try {
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("Username", sql.NVarChar, "admin")
      .query("SELECT * FROM Users WHERE Username = @Username");

    if (result.recordset.length === 0) {

      const hashedPassword = await bcrypt.hash("123456", 10);

      await pool.request()
        .input("Username", sql.NVarChar, "admin")
        .input("Email", sql.NVarChar, "admin@gmail.com")
        .input("PasswordHash", sql.NVarChar, hashedPassword)
        .input("Role", sql.NVarChar, "admin")
        .query(`
          INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
          VALUES (@Username, @Email, @PasswordHash, @Role, GETDATE())
        `);

      console.log("🔥 Admin created successfully!");
    } else {
      console.log("⚡ Admin already exists");
    }

  } catch (err) {
    console.log("Init admin error:", err);
  }
}

module.exports = initAdmin;