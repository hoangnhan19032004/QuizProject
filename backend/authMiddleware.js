// quiz-backend/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

/* =====================================================
   1️⃣ AUTHENTICATE
===================================================== */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc thiếu token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role?.toLowerCase(), // 🔥 ép về chữ thường
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.'
    });
  }
};

/* =====================================================
   2️⃣ AUTHORIZE (không phân biệt hoa thường)
===================================================== */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng.'
      });
    }

    const userRole = req.user.role?.toLowerCase();
    const roles = allowedRoles.map(r => r.toLowerCase());

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này.'
      });
    }

    next();
  };
};

/* =====================================================
   3️⃣ Shortcut
===================================================== */
const isAdmin = authorize('admin');
const isUser  = authorize('user');
const isAdminOrUser = authorize('admin', 'user');

/* =====================================================
   4️⃣ EXPORT
===================================================== */
module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isUser,
  isAdminOrUser
};