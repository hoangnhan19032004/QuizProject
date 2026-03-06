require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');
const sql = require('mssql');

const { poolConnect, pool } = require('./db');
const createAdminIfNotExist = require('./initAdmin');
const { authenticate, isAdmin } = require('./authMiddleware');

// ROUTES
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require("./routes/admin");



const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';


// ✅ AUTO CREATE UPLOAD FOLDERS
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`🟢 Created folder: ${dir}`);
  }
};

ensureDir(path.join(__dirname, 'uploads'));
ensureDir(path.join(__dirname, 'uploads/avatars'));
ensureDir(path.join(__dirname, 'uploads/bookings'));


// ✅ MIDDLEWARE
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());


// ✅ MULTER
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${Date.now()}${ext}`);
  }
});

const uploadAvatar = multer({ storage: avatarStorage });


// ✅ DEBUG ROUTES (QUAN TRỌNG)
const checkRoute = (route, name) => {
  if (typeof route !== 'function') {
    console.error(`❌ Route "${name}" is NOT a function`);
    process.exit(1);
  }
};

// check tất cả
checkRoute(authRoutes, 'authRoutes');


// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);

// ✅ UPLOAD AVATAR
app.put(
  '/api/users/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded!' });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      await pool.request()
        .input('avatar', sql.VarChar(255), avatarPath)
        .input('id', sql.Int, req.user.id)
        .query(`
          UPDATE Users
          SET avatar = @avatar, updatedAt = GETDATE()
          WHERE id = @id
        `);

      res.json({ avatar: avatarPath });

    } catch (err) {
      next(err);
    }
  }
);


// HEALTH CHECK
app.get('/', (req, res) => {
  res.send('🔥 Quiz API running!');
});


// GLOBAL ERROR
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err);
  res.status(500).json({
    message: err.message || 'Internal server error'
  });
});


// START SERVER
poolConnect
  .then(async () => {
    console.log('🟢 Connected to SQL Server');

    await createAdminIfNotExist();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('🔴 Database connection failed:', err);
  });
