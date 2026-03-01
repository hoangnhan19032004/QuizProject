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

      const hashed = await bcrypt.hash("123456", 10);

      await pool.request()
        .input("Username", sql.NVarChar, "admin")
        .input("Password", sql.NVarChar, hashed)
        .input("Role", sql.NVarChar, "admin")
        .query(`
          INSERT INTO Users (Username, Password, Role)
          VALUES (@Username, @Password, @Role)
        `);

      console.log("🔥 Admin created!");
    }
  } catch (err) {
    console.log("Init admin error:", err);
  }
}

module.exports = initAdmin;
