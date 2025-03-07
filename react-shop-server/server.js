const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json())

const port = 5003;
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// use middleware to serve static images
app.use(express.static('public'))

// read data from file
const travelDataRaw = fs.readFileSync('./travel.json', 'utf-8');
const travelData = JSON.parse(travelDataRaw);

const SECRET_KEY = 'your-secret-key-here';
let users = [];

// 사용자 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// 회원가입 API
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      points: 5000 // 초기 포인트
    };
    
    users.push(user);
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인 API
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        points: user.points
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회 API
app.get('/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    points: user.points
  });
});

app.get('/products', (req, res) => {
  res.json(travelData.countries)
})

app.get('/options', (req, res) => {
  res.json(travelData.options)
})

let orderHistory = [];

app.post('/order', authenticateToken, (req, res) => {
  const orderNumber = Math.floor(Math.random() * 1000000000);
  let order = {price: req.body.totals.total, orderNumber};
  orderHistory.push(order);
  res.status(201).json({ orderNumber }); // 새로 생성된 주문 번호만 반환
});

app.get('/order-history', (req, res) => {
  res.status(200).json(orderHistory);
});

app.delete('/order-history', (req, res) => {
  orderHistory = []; // ✅ 주문 기록 초기화
  res.status(200).json({ message: "Order history cleared" });
});

if (require.main === module) {
  app.listen(port, () => console.log(`listening on port ${port}`))
}

module.exports = app;