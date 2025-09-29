// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// ===== Config =====
const PORT = 5050; // tránh đụng AirPlay 5000 trên macOS
const JWT_SECRET = 'dev-secret-change-me';
const JWT_TTL = '1h'; // 1 giờ

// ===== Middlewares chung =====
app.use(express.json());
app.use(cookieParser());

// ===== Auth middleware (đọc JWT từ cookie hoặc Authorization nếu có) =====
function auth(req, res, next) {
  const cookieToken = req.cookies?.access_token;
  const authz = req.header('Authorization');
  const headerToken = authz && authz.startsWith('Bearer ') ? authz.slice(7) : null;

  const token = cookieToken || headerToken;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload.user; // gắn user vào req
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ===== Login (mock) — phát JWT và set cookie HttpOnly =====
// Body mẫu: { "user": { "id": 1, "name": "A", "roles": ["employee"] } }
app.post('/login', (req, res) => {
  const { user } = req.body || {};
  if (!user) return res.status(400).json({ message: 'Missing user in body' });

  const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_TTL });

  // Cookie: HttpOnly để JS browser không đọc được; bật Secure khi dùng HTTPS
  res.cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    // secure: true, // bật khi chạy HTTPS
    maxAge: 60 * 60 * 1000, // 1h
  });

  return res.json({ message: 'Logged in (cookie set)' });
});

// ===== Logout — xoá cookie =====
app.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.status(204).end();
});

// ===== Group routes: /user/* (bảo vệ bằng auth) =====
const userRouter = express.Router();

userRouter.get('/profile', (req, res) => {
  // tới đây đã qua auth, có req.user
  return res.json({ message: 'OK', user: req.user });
});

userRouter.get('/me/roles', (req, res) => {
  return res.json({ roles: req.user?.roles || [] });
});

app.use('/user', auth, userRouter);

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});


// # 1) Login: gửi user và BẢO curl LƯU cookie mà server set
// curl -c cookie.txt -X POST http://localhost:5050/login \
//   -H "Content-Type: application/json" \
//   -d '{"user":{"id":1,"name":"A","roles":["employee"]}}'

// # 2) Gọi /user/profile: BẢO curl GỬI LẠI cookie đã lưu
// curl -b cookie.txt http://localhost:5050/user/profile
