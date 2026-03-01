// quiz-backend/db.js
const sql = require('mssql');
const config = require('./dbConfig');

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect
};
