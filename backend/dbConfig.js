// quiz-backend/dbConfig.js
module.exports = {
  user: 'quiz_user',             // ← THAY đúng tên user SQL Server bạn đã tạo
  password: '123456',        // ← và mật khẩu đã tạo
  server: 'LAPTOP-5NPRLUM8',       // ← giống như tên trong SSMS của bạn
  database: 'QuizDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

