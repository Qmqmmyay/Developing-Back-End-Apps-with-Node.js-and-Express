// ==========================
// apiServer.js (annotated)
// ==========================

// 1) Nạp biến môi trường từ file .env vào process.env
require('dotenv').config();

// 2) Import thư viện:
//    - express: web framework
//    - jsonwebtoken: ký & kiểm JWT
const express = require('express');
const jwt = require('jsonwebtoken');

// 3) Tạo app Express
const app = express();

// 4) Middleware built-in để parse JSON body (Content-Type: application/json)
//    Sau bước này, req.body sẽ là object đã parse
app.use(express.json());

// 5) Đọc PORT & JWT_SECRET từ biến môi trường (có default cho dev)
//    Lưu ý: nên đặt trong .env, KHÔNG hardcode secret vào code
const PORT = process.env.PORT || 5050; // đổi 5050 để ko đụng AirPlay 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

// --------------------------
// (A) /signin: cấp token JWT
// --------------------------
// - Client gửi { uname, pwd } trong body
// - Thực tế bạn sẽ kiểm DB + password hash
// - Ở demo này, chấp nhận uname=user & pwd=pass123
app.post('/signin', (req, res) => {
  // 6) Lấy uname, pwd từ body (đã được express.json() parse)
  const { uname, pwd } = req.body || {};

  // 7) Validate đơn giản (DEMO, KHÔNG dùng trong production)
  if (uname === 'user' && pwd === 'pass123') {
    // 8) Tạo payload cho JWT. Có thể chứa user/roles/claims cần thiết
    const payload = { user: 'user', roles: ['employee'] };

    // 9) Ký JWT bằng secret; đặt hạn để giảm rủi ro lộ token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // 10) Trả token cho client; client tự lưu (localStorage/cookie/…)
    return res.json({ token });
  }

  // 11) Sai thông tin -> 401 (Unauthorized)
  return res.status(401).json({ message: 'Invalid credentials' });
});

// -------------------------------------------
// (B) auth middleware: bảo vệ các route phía sau
// -------------------------------------------
// - Đọc header Authorization: 'Bearer <JWT>'
// - Tách token, verify chữ ký & hạn
// - Thành công => gắn payload vào req.user rồi next()
// - Thất bại => 401
function auth(req, res, next) {
  // 12) Lấy header Authorization
  const authz = req.header('Authorization');

  // 13) Không có header -> 401
  if (!authz) return res.status(401).json({ message: 'No Token' });

  // 14) Kỳ vọng format: 'Bearer <token>'
  const [scheme, token] = authz.split(' ');

  // 15) Sai format hoặc thiếu token -> 401
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid Authorization header' });
  }

  try {
    // 16) Xác thực token: kiểm chữ ký + hạn (exp)
    const payload = jwt.verify(token, JWT_SECRET);

    // 17) Lưu payload vào req để route sau dùng (ví dụ req.user.roles)
    req.user = payload;

    // 18) Cho phép đi tiếp
    next();
  } catch (err) {
    // 19) Token sai/hết hạn -> 401
    return res.status(401).json({ message: 'Please login to access this resource' });
  }
}

// ------------------------------
// (C) /employees: route được bảo vệ
// ------------------------------
// - Thêm 'auth' trước handler -> bắt buộc có JWT hợp lệ
app.get('/employees', auth, (req, res) => {
  // 20) Đến đây tức là đã xác thực thành công
  //     Bạn có thể check quyền từ req.user.roles nếu cần
  return res.status(200).json({
    message: 'Access Successful to Employee Endpoint',
    user: req.user, // cho demo thấy payload sau khi verify
  });
});

// ------------------------------
// (D) Lắng nghe cổng
// ------------------------------
app.listen(PORT, () => {
  // 21) Log để biết server chạy ở đâu
  console.log(`API Server is localhost:${PORT}`);
});
