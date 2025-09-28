# 八達通O! ePay支付平台 - API參考文檔

## 📋 概述

本文檔提供了八達通O! ePay支付平台所有API端點的詳細說明，包括請求格式、響應格式、錯誤代碼和示例。

**Base URL**: `https://your-api-domain.com/api`

---

## 🔐 認證

### API密鑰認證
所有API請求都需要在Header中包含認證信息：

```http
Authorization: Bearer your_api_token
X-API-Key: your_api_key
Content-Type: application/json
```

### 八達通API認證
與八達通API通信時需要額外的認證頭：

```http
X-Octopus-Merchant-ID: your_merchant_id
X-Octopus-Timestamp: 2024-01-01T00:00:00Z
X-Octopus-Nonce: random_nonce_string
X-Octopus-Signature: calculated_signature
```

---

## 📦 訂單管理 API

### 創建訂單
創建一個新的訂單。

```http
POST /orders
```

**請求體:**
```json
{
  "description": "商品描述",
  "amount": 100.00,
  "currency": "HKD",
  "customerEmail": "customer@example.com",
  "customerPhone": "+852 1234 5678",
  "metadata": {
    "productId": "PROD_001",
    "category": "electronics",
    "customField": "value"
  }
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-ABC123DEF",
    "description": "商品描述",
    "amount": 100.00,
    "currency": "HKD",
    "status": "pending",
    "customerEmail": "customer@example.com",
    "customerPhone": "+852 1234 5678",
    "metadata": {
      "productId": "PROD_001",
      "category": "electronics",
      "customField": "value"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "訂單已創建"
}
```

**錯誤響應:**
```json
{
  "success": false,
  "message": "驗證失敗",
  "errors": [
    {
      "field": "amount",
      "message": "金額必須大於0"
    }
  ]
}
```

### 獲取訂單
根據訂單ID獲取訂單詳情。

```http
GET /orders/{orderId}
```

**路徑參數:**
- `orderId` (string): 訂單的唯一標識符

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-ABC123DEF",
    "description": "商品描述",
    "amount": 100.00,
    "currency": "HKD",
    "status": "pending",
    "customerEmail": "customer@example.com",
    "customerPhone": "+852 1234 5678",
    "metadata": {
      "productId": "PROD_001",
      "category": "electronics"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "payment": {
      "id": "payment-uuid",
      "status": "pending",
      "paymentToken": "wG6YPjY"
    }
  }
}
```

### 更新訂單
更新訂單信息。

```http
PATCH /orders/{orderId}
```

**請求體:**
```json
{
  "description": "更新的商品描述",
  "amount": 150.00,
  "status": "confirmed",
  "metadata": {
    "updatedField": "new_value"
  }
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-ABC123DEF",
    "description": "更新的商品描述",
    "amount": 150.00,
    "currency": "HKD",
    "status": "confirmed",
    "updatedAt": "2024-01-01T00:05:00Z"
  },
  "message": "訂單已更新"
}
```

---

## 💳 支付管理 API

### 創建支付請求
為訂單創建支付請求。

```http
POST /payments
```

**請求體:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100.00,
  "currency": "HKD",
  "method": "octopus_qr",
  "description": "支付描述",
  "returnUrl": "https://your-domain.com/payment-success",
  "cancelUrl": "https://your-domain.com/payment-cancel"
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid-123",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100.00,
    "currency": "HKD",
    "status": "pending",
    "method": "octopus_qr",
    "paymentToken": "wG6YPjY",
    "qrCodeData": "{\"url\":\"https://www.online-octopus.com/oos/payment/?token=wG6YPjY\",\"token\":\"wG6YPjY\",\"merchantId\":\"demo_merchant_123\",\"orderId\":\"550e8400-e29b-41d4-a716-446655440000\",\"paymentId\":\"payment-uuid-123\",\"amount\":100,\"currency\":\"HKD\",\"timestamp\":\"2024-01-01T00:00:00Z\"}",
    "octopusTransactionId": null,
    "octopusResponse": null,
    "failureReason": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "completedAt": null
  },
  "message": "支付請求已創建"
}
```

### 獲取支付狀態
根據支付ID獲取支付狀態。

```http
GET /payments/{paymentId}
```

**路徑參數:**
- `paymentId` (string): 支付的唯一標識符

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid-123",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100.00,
    "currency": "HKD",
    "status": "completed",
    "method": "octopus_qr",
    "paymentToken": "wG6YPjY",
    "qrCodeData": "{\"url\":\"https://www.online-octopus.com/oos/payment/?token=wG6YPjY\",...}",
    "octopusTransactionId": "oct_123456789",
    "octopusResponse": "{\"status\":\"SUCCESS\",\"transactionId\":\"oct_123456789\",\"amount\":100,\"currency\":\"HKD\",\"timestamp\":\"2024-01-01T00:05:00Z\"}",
    "failureReason": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:05:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  }
}
```

### 更新支付狀態
更新支付狀態（內部使用）。

```http
PATCH /payments/{paymentId}/status
```

**請求體:**
```json
{
  "status": "completed",
  "octopusTransactionId": "oct_123456789",
  "octopusResponse": "{\"status\":\"SUCCESS\",...}",
  "failureReason": null
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid-123",
    "status": "completed",
    "octopusTransactionId": "oct_123456789",
    "updatedAt": "2024-01-01T00:05:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  },
  "message": "支付狀態已更新"
}
```

### 模擬支付（測試用）
模擬支付成功（僅用於測試環境）。

```http
POST /payments/{paymentId}/simulate
```

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid-123",
    "status": "completed",
    "octopusTransactionId": "sim_123456789",
    "octopusResponse": "{\"status\":\"SUCCESS\",\"message\":\"模擬支付成功\"}",
    "updatedAt": "2024-01-01T00:05:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  },
  "message": "模擬支付完成"
}
```

---

## 🔄 WebSocket 實時通信

### 連接WebSocket
```javascript
const socket = io('https://your-api-domain.com');

// 監聽連接狀態
socket.on('connect', () => {
  console.log('WebSocket連接成功');
});

socket.on('disconnect', () => {
  console.log('WebSocket連接斷開');
});
```

### 支付狀態更新事件
當支付狀態發生變化時，服務器會發送 `paymentUpdate` 事件。

```javascript
socket.on('paymentUpdate', (data) => {
  console.log('支付狀態更新:', data);
  // 數據格式:
  // {
  //   paymentId: "payment-uuid-123",
  //   orderId: "order-uuid",
  //   status: "completed",
  //   amount: 100.00,
  //   currency: "HKD",
  //   completedAt: "2024-01-01T00:05:00Z"
  // }
});
```

### 訂單狀態更新事件
當訂單狀態發生變化時，服務器會發送 `orderUpdate` 事件。

```javascript
socket.on('orderUpdate', (data) => {
  console.log('訂單狀態更新:', data);
  // 數據格式:
  // {
  //   orderId: "order-uuid",
  //   status: "completed",
  //   timestamp: "2024-01-01T00:05:00Z"
  // }
});
```

### 加入支付房間
為了接收特定支付的實時更新，需要加入支付房間。

```javascript
socket.emit('joinPaymentRoom', paymentId);
```

### 離開支付房間
```javascript
socket.emit('leavePaymentRoom', paymentId);
```

---

## 🔗 八達通API Webhook

### Webhook端點
八達通會向此端點發送支付狀態更新。

```http
POST /payments/webhook/octopus
```

**請求頭:**
```http
Content-Type: application/json
X-Octopus-Signature: webhook_signature
X-Octopus-Timestamp: 2024-01-01T00:00:00Z
```

**請求體:**
```json
{
  "eventType": "payment.completed",
  "transactionId": "oct_123456789",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "SUCCESS",
  "amount": 100.00,
  "currency": "HKD",
  "timestamp": "2024-01-01T00:05:00Z",
  "merchantId": "your_merchant_id",
  "signature": "webhook_signature"
}
```

**響應:**
```json
{
  "success": true,
  "message": "Webhook處理成功"
}
```

---

## 📊 狀態代碼

### 訂單狀態
| 狀態 | 描述 |
|------|------|
| `pending` | 等待處理 |
| `confirmed` | 已確認 |
| `processing` | 處理中 |
| `completed` | 已完成 |
| `cancelled` | 已取消 |
| `failed` | 失敗 |

### 支付狀態
| 狀態 | 描述 |
|------|------|
| `pending` | 等待支付 |
| `processing` | 處理中 |
| `completed` | 支付成功 |
| `failed` | 支付失敗 |
| `cancelled` | 支付取消 |
| `refunded` | 已退款 |

### HTTP狀態碼
| 狀態碼 | 描述 |
|--------|------|
| `200` | 成功 |
| `201` | 創建成功 |
| `400` | 請求錯誤 |
| `401` | 未授權 |
| `403` | 禁止訪問 |
| `404` | 資源不存在 |
| `422` | 驗證失敗 |
| `500` | 服務器錯誤 |

---

## ❌ 錯誤處理

### 錯誤響應格式
```json
{
  "success": false,
  "message": "錯誤描述",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "字段錯誤描述"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/endpoint"
}
```

### 常見錯誤代碼
| 錯誤代碼 | HTTP狀態碼 | 描述 |
|----------|------------|------|
| `VALIDATION_ERROR` | 422 | 數據驗證失敗 |
| `ORDER_NOT_FOUND` | 404 | 訂單不存在 |
| `PAYMENT_NOT_FOUND` | 404 | 支付記錄不存在 |
| `INVALID_AMOUNT` | 400 | 無效的金額 |
| `PAYMENT_ALREADY_EXISTS` | 409 | 支付已存在 |
| `OCTOPUS_API_ERROR` | 502 | 八達通API錯誤 |
| `INSUFFICIENT_FUNDS` | 402 | 餘額不足 |
| `PAYMENT_EXPIRED` | 410 | 支付已過期 |
| `INVALID_SIGNATURE` | 401 | 無效的簽名 |
| `RATE_LIMIT_EXCEEDED` | 429 | 請求頻率超限 |

### 八達通API錯誤代碼
| 錯誤代碼 | 描述 |
|----------|------|
| `E001` | 無效的商戶ID |
| `E002` | 簽名驗證失敗 |
| `E003` | 支付記錄不存在 |
| `E004` | 餘額不足 |
| `E005` | 網絡錯誤 |
| `E006` | 支付已過期 |
| `E007` | 重複支付 |
| `E008` | 系統維護中 |

---

## 🔍 查詢參數

### 分頁參數
```http
GET /orders?page=1&limit=10&sort=createdAt&order=desc
```

| 參數 | 類型 | 默認值 | 描述 |
|------|------|--------|------|
| `page` | number | 1 | 頁碼 |
| `limit` | number | 10 | 每頁數量 |
| `sort` | string | createdAt | 排序字段 |
| `order` | string | desc | 排序方向 (asc/desc) |

### 過濾參數
```http
GET /orders?status=pending&amount_min=10&amount_max=100&created_after=2024-01-01
```

| 參數 | 類型 | 描述 |
|------|------|------|
| `status` | string | 訂單狀態過濾 |
| `amount_min` | number | 最小金額 |
| `amount_max` | number | 最大金額 |
| `created_after` | string | 創建時間之後 (ISO 8601) |
| `created_before` | string | 創建時間之前 (ISO 8601) |

---

## 📝 示例代碼

### JavaScript/TypeScript
```typescript
// 創建訂單
const createOrder = async (orderData: any) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
};

// 創建支付
const createPayment = async (paymentData: any) => {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    },
    body: JSON.stringify(paymentData)
  });
  
  return await response.json();
};

// WebSocket連接
const socket = io('https://your-api-domain.com');
socket.on('paymentUpdate', (data) => {
  console.log('支付更新:', data);
});
```

### cURL
```bash
# 創建訂單
curl -X POST https://your-api-domain.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_token" \
  -d '{
    "description": "商品描述",
    "amount": 100.00,
    "currency": "HKD",
    "customerEmail": "customer@example.com"
  }'

# 獲取支付狀態
curl -X GET https://your-api-domain.com/api/payments/payment-uuid-123 \
  -H "Authorization: Bearer your_api_token"
```

### Python
```python
import requests
import json

# 創建訂單
def create_order(order_data):
    response = requests.post(
        'https://your-api-domain.com/api/orders',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_token}'
        },
        json=order_data
    )
    return response.json()

# 創建支付
def create_payment(payment_data):
    response = requests.post(
        'https://your-api-domain.com/api/payments',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_token}'
        },
        json=payment_data
    )
    return response.json()
```

---

## 🔒 安全最佳實踐

### 1. API密鑰管理
- 使用環境變量存儲API密鑰
- 定期輪換API密鑰
- 不要在客戶端代碼中暴露密鑰

### 2. 請求簽名
- 所有API請求都應該包含簽名
- 使用HMAC-SHA256算法生成簽名
- 包含時間戳防止重放攻擊

### 3. HTTPS
- 所有API通信都必須使用HTTPS
- 使用有效的SSL證書
- 啟用HSTS

### 4. 速率限制
- 實施API速率限制
- 監控異常請求模式
- 使用IP白名單（如適用）

---

## 📞 技術支持

- **API文檔**: 本文檔
- **快速開始**: [快速開始指南](./QUICK_START_GUIDE.md)
- **完整文檔**: [技術整合指南](./TECHNICAL_INTEGRATION_GUIDE.md)
- **示例代碼**: [GitHub Repository](https://github.com/your-org/octopus-payment-platform)
- **技術支持**: tech-support@yourcompany.com
- **狀態頁面**: https://status.yourcompany.com

---

**API版本**: v1.0.0  
**最後更新**: 2024年1月  
**文檔版本**: 1.0.0
