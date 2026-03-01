// quiz-backend/test-smtp.js
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  try {
    // 1. Tạo transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,                  // thường là smtp.gmail.com
      port: Number(process.env.EMAIL_PORT),          // 465 hoặc 587
      secure: process.env.EMAIL_SECURE === 'true',   // true nếu port=465
      auth: {
        user: process.env.EMAIL_USER,                // email Gmail của bạn
        pass: process.env.EMAIL_PASS                 // App Password (16 ký tự, không dấu cách)
      }
    });

    // 2. Gọi verify() để kiểm tra kết nối SMTP
    await transporter.verify();
    console.log('✔ SMTP ready: Đăng nhập thành công với thông tin hiện tại.');

    // 3. Gửi email thử nghiệm (không bắt buộc, chỉ để chắc chắn thực sự gửi được)
    const info = await transporter.sendMail({
      from: `"HAIR Salon Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,    // bạn có thể gửi cho chính mình
      subject: 'Test SMTP Quiz - Thành công!',
      text: 'Nếu bạn nhận được email này, SMTP đã hoạt động bình thường.',
      html: '<p>Nếu bạn nhận được email này, SMTP đã hoạt động bình thường.</p>'
    });
    console.log('✔ Email test đã gửi, MessageId =', info.messageId);
  } catch (err) {
    console.error('✗ Lỗi SMTP:', err);
  }
})();
