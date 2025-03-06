const express = require('express');
const cors = require('cors');
const fs = require('fs');

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

app.get('/products', (req, res) => {
  res.json(travelData.countries)
})

app.get('/options', (req, res) => {
  res.json(travelData.options)
})

let orderHistory = [];

app.post('/order', (req, res) => {
  const orderNumber = Math.floor(Math.random() * 1000000);
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