const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 內存存儲
let orders = [];
let payments = [];

// 生成訂單編號
function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// 生成付款編號
function generatePaymentToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 創建訂單
app.post('/orders', (req, res) => {
  try {
    const order = {
      id: uuidv4(),
      orderNumber: generateOrderNumber(),
      description: req.body.description,
      amount: req.body.amount,
      currency: req.body.currency || 'HKD',
      status: 'pending',
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      createdAt: new Date(),
    };

    orders.push(order);
    
    res.json({
      success: true,
      data: order,
      message: '訂單已創建',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 獲取訂單
app.get('/orders/:id', (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '訂單不存在',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 創建支付
app.post('/payments', (req, res) => {
  try {
    const paymentToken = generatePaymentToken();
    const payment = {
      id: uuidv4(),
      orderId: req.body.orderId,
      amount: req.body.amount,
      currency: req.body.currency || 'HKD',
      status: 'pending',
      method: req.body.method || 'octopus_qr',
      paymentToken: paymentToken,
      qrCodeData: JSON.stringify({
        url: `https://www.online-octopus.com/oos/payment/?token=${paymentToken}`,
        token: paymentToken,
        merchantId: 'demo_merchant_123',
        orderId: req.body.orderId,
        paymentId: uuidv4(),
        amount: req.body.amount,
        currency: req.body.currency || 'HKD',
        timestamp: new Date().toISOString(),
      }),
      createdAt: new Date(),
    };

    payments.push(payment);
    
    res.json({
      success: true,
      data: payment,
      message: '支付請求已創建',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 獲取支付
app.get('/payments/:id', (req, res) => {
  try {
    const payment = payments.find(p => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '支付記錄不存在',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 模擬支付
app.post('/payments/:id/simulate', (req, res) => {
  try {
    const payment = payments.find(p => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '支付記錄不存在',
      });
    }

    payment.status = 'completed';
    payment.octopusTransactionId = `oct_${Date.now()}`;

    res.json({
      success: true,
      data: payment,
      message: '模擬支付完成',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '八達通支付後端服務運行正常',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`🚀 八達通支付後端服務已啟動在端口 ${port}`);
  console.log(`📡 API地址: http://localhost:${port}`);
  console.log(`💡 健康檢查: http://localhost:${port}/health`);
});
