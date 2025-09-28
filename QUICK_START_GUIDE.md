# 八達通O! ePay支付平台 - 快速開始指南

## 🚀 5分鐘快速整合

### 1. 安裝依賴
```bash
npm install axios socket.io-client qrcode @types/qrcode
```

### 2. 複製支付組件
將以下組件複製到您的項目中：

```typescript
// components/OctopusPayment.tsx
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { io, Socket } from 'socket.io-client';

interface PaymentProps {
  orderId: string;
  amount: number;
  description: string;
  apiUrl?: string;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

const OctopusPayment: React.FC<PaymentProps> = ({
  orderId,
  amount,
  description,
  apiUrl = 'http://localhost:3001',
  onSuccess,
  onError
}) => {
  const [payment, setPayment] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);

  useEffect(() => {
    const newSocket = io(apiUrl);
    setSocket(newSocket);

    newSocket.on('paymentUpdate', (data) => {
      if (data.paymentId === payment?.id) {
        setPayment(prev => ({ ...prev, ...data }));
        if (data.status === 'completed') {
          onSuccess(data);
        } else if (data.status === 'failed') {
          onError('支付失敗');
        }
      }
    });

    return () => newSocket.close();
  }, [payment?.id, apiUrl, onSuccess, onError]);

  useEffect(() => {
    if (timeRemaining > 0 && payment?.status === 'pending') {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, payment?.status]);

  const createPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'HKD',
          method: 'octopus_qr'
        })
      });

      const result = await response.json();
      if (result.success) {
        setPayment(result.data);
        generateQRCode(result.data.qrCodeData);
        setTimeRemaining(300);
      } else {
        onError(result.message);
      }
    } catch (error) {
      onError('網絡錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      const qrUrl = await QRCode.toDataURL(data.url, { width: 300, margin: 2 });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      onError('QR Code生成失敗');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="octopus-payment">
      {!payment ? (
        <button 
          onClick={createPayment} 
          disabled={isLoading}
          className="payment-button"
        >
          {isLoading ? '創建中...' : '開始八達通支付'}
        </button>
      ) : (
        <div className="payment-interface">
          <div className="payment-header">
            <h3>八達通網上付款服務</h3>
            <div className="countdown">
              <span>尚餘時間: {formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="payment-details">
            <div className="detail-row">
              <span>商戶名稱</span>
              <span>您的商戶</span>
            </div>
            <div className="detail-row">
              <span>金額</span>
              <span>HKD ${amount}</span>
            </div>
            <div className="detail-row">
              <span>商品描述</span>
              <span>{description}</span>
            </div>
          </div>

          <div className="qr-section">
            <p>請使用八達通App掃描QR Code或輸入付款編號</p>
            {qrCodeUrl && (
              <div className="qr-code">
                <img src={qrCodeUrl} alt="支付QR Code" />
              </div>
            )}
            <div className="payment-token">
              <p>付款編號: <strong>{payment.paymentToken}</strong></p>
            </div>
          </div>

          <div className="status">
            狀態: {payment.status === 'pending' ? '等待支付' : payment.status}
          </div>
        </div>
      )}
    </div>
  );
};

export default OctopusPayment;
```

### 3. 添加樣式
```css
/* styles/octopus-payment.css */
.octopus-payment {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.payment-button {
  width: 100%;
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.payment-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.payment-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.payment-header h3 {
  color: #2563eb;
  margin: 0;
}

.countdown {
  color: #dc2626;
  font-weight: bold;
}

.payment-details {
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.qr-section {
  text-align: center;
  margin-bottom: 20px;
}

.qr-code img {
  display: block;
  margin: 15px auto;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.payment-token {
  background: #f0f9ff;
  padding: 10px;
  border-radius: 6px;
  margin-top: 15px;
}

.status {
  text-align: center;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  font-weight: 500;
}
```

### 4. 在您的頁面中使用
```typescript
// pages/checkout.tsx
import OctopusPayment from '../components/OctopusPayment';

const CheckoutPage = () => {
  const handlePaymentSuccess = (paymentData: any) => {
    console.log('支付成功:', paymentData);
    // 跳轉到成功頁面或顯示成功信息
    alert('支付成功！');
  };

  const handlePaymentError = (error: string) => {
    console.error('支付錯誤:', error);
    alert(`支付錯誤: ${error}`);
  };

  return (
    <div>
      <h1>結帳</h1>
      <OctopusPayment
        orderId="ORDER-123"
        amount={100.00}
        description="商品購買"
        apiUrl="https://your-api-domain.com"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};
```

## 🔧 後端API設置

### 1. 環境變量配置
```env
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=octopus_payment

OCTOPUS_API_URL=https://api.octopus.com.hk
OCTOPUS_MERCHANT_ID=your_merchant_id
OCTOPUS_SECRET_KEY=your_secret_key
OCTOPUS_WEBHOOK_SECRET=your_webhook_secret

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
```

### 2. 數據庫設置
```sql
-- 創建數據庫
CREATE DATABASE octopus_payment;

-- 創建用戶
CREATE USER octopus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE octopus_payment TO octopus_user;
```

### 3. 啟動服務
```bash
# 安裝依賴
npm install

# 運行數據庫遷移
npm run migration:run

# 啟動服務
npm run start:prod
```

## 📱 八達通App整合

### 1. 獲取商戶帳戶
1. 訪問 [八達通商戶平台](https://www.octopus.com.hk/business)
2. 填寫申請表並提交文件
3. 等待審核通過
4. 獲取API密鑰

### 2. 配置API密鑰
```typescript
// 在環境變量中設置
OCTOPUS_MERCHANT_ID=your_merchant_id_from_octopus
OCTOPUS_SECRET_KEY=your_secret_key_from_octopus
OCTOPUS_WEBHOOK_SECRET=your_webhook_secret_from_octopus
```

### 3. 測試支付流程
1. 使用測試環境的API密鑰
2. 創建測試訂單
3. 使用八達通App掃描QR Code
4. 確認支付狀態更新

## 🚨 常見問題

### Q: QR Code無法生成？
A: 檢查qrcode庫是否正確安裝，確保傳入的數據格式正確。

### Q: WebSocket連接失敗？
A: 檢查CORS設置和Socket.IO配置，確保端口正確。

### Q: 支付狀態不更新？
A: 檢查WebSocket連接和輪詢機制，確保後端服務正常運行。

### Q: 八達通API調用失敗？
A: 檢查API密鑰配置，確保商戶帳戶已激活。

## 📞 技術支持

- 文檔: [完整技術文檔](./TECHNICAL_INTEGRATION_GUIDE.md)
- 示例: [GitHub Repository](https://github.com/your-org/octopus-payment-platform)
- 支持: tech-support@yourcompany.com

---

**快速開始完成！** 🎉

現在您可以在5分鐘內將八達通支付功能整合到您的網站中。
