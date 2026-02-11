const sql = require("mssql");

const config = {
  user: "sa",          // hoặc user SQL của bạn
  password: "123456",
  server: "localhost",
  database: "QuizDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => console.log("Database Connection Failed!", err));

module.exports = {
  sql,
  pool,
};
