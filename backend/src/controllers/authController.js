const users = [
  { id: 1, username: "admin@gmail.com", password: "123456" }
];

exports.login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Sai tài khoản hoặc mật khẩu"
    });
  }

  res.json({
    message: "Đăng nhập thành công",
    user: {
      id: user.id,
      username: user.username
    }
  });
};
