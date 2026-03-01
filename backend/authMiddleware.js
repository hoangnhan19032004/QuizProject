// quiz-backend/authMiddleware.js
const jwt = require('jsonwebtoken');

// Mã bí mật để mã hóa và giải mã token
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

/*-------------------------------------------------
  1. XÁC THỰC - verify JWT, gán req.user
--------------------------------------------------*/
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Kiểm tra nếu không có token trong header
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu token. Vui lòng cung cấp token hợp lệ.' });
  }

  const token = authHeader.split(' ')[1]; // Lấy token từ header

  try {
    // Giải mã token và gán thông tin người dùng vào req.user
    req.user = jwt.verify(token, JWT_SECRET);   // { id, role, username }
    next();  // Tiếp tục với middleware hoặc route handler tiếp theo
  } catch (err) {
    // Nếu token không hợp lệ hoặc hết hạn
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

/*-------------------------------------------------
  2. PHÂN QUYỀN (HOF)
     authorize('admin','staff') …
--------------------------------------------------*/
const authorize = (...roles) => (req, res, next) => {
  // Kiểm tra xem user có vai trò phù hợp không
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa xác thực người dùng. Vui lòng đăng nhập.' });
  }
  
  // Kiểm tra role của user có trong danh sách roles không
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Không có quyền truy cập. Bạn không đủ quyền.' });
  }

  next(); // Nếu có quyền, tiếp tục đến middleware tiếp theo
}

/*-------------------------------------------------
  3. Shortcut theo yêu cầu
--------------------------------------------------*/
const isAdmin        = authorize('admin');
const isStaff        = authorize('staff');
const isAdminOrStaff = authorize('admin', 'staff');

/*-------------------------------------------------
  4. EXPORT
--------------------------------------------------*/
module.exports = {
  authenticate,      // middleware verify token
  authorize,         // dùng tuỳ biến
  isAdmin,           // Kiểm tra admin
  isStaff,           // Kiểm tra staff
  isAdminOrStaff,    // Kiểm tra admin hoặc staff
};
