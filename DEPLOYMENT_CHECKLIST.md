# 八達通O! ePay支付平台 - 部署檢查清單

## 📋 部署前檢查清單

### ✅ 環境準備
- [ ] Node.js 18+ 已安裝
- [ ] PostgreSQL 12+ 已安裝並運行
- [ ] npm 或 yarn 已安裝
- [ ] Git 已安裝
- [ ] 服務器訪問權限已獲得

### ✅ 八達通商戶帳戶
- [ ] 已申請八達通商戶帳戶
- [ ] 商戶帳戶已激活
- [ ] 已獲取API密鑰
- [ ] 已獲取Webhook密鑰
- [ ] 已測試API連接

### ✅ 項目配置
- [ ] 已克隆項目代碼
- [ ] 已安裝所有依賴
- [ ] 已配置環境變量
- [ ] 已設置數據庫連接
- [ ] 已運行數據庫遷移

### ✅ 安全配置
- [ ] 已配置HTTPS證書
- [ ] 已設置防火牆規則
- [ ] 已配置API速率限制
- [ ] 已設置日誌監控
- [ ] 已配置備份策略

---

## 🚀 部署步驟

### 1. 服務器準備
```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 安裝Nginx
sudo apt install nginx -y

# 安裝PM2
sudo npm install -g pm2
```

### 2. 數據庫設置
```bash
# 切換到postgres用戶
sudo -u postgres psql

# 創建數據庫和用戶
CREATE DATABASE octopus_payment;
CREATE USER octopus_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE octopus_payment TO octopus_user;
\q
```

### 3. 項目部署
```bash
# 克隆項目
git clone https://github.com/your-org/octopus-payment-platform.git
cd octopus-payment-platform

# 安裝依賴
npm install
cd backend && npm install && cd ..

# 配置環境變量
cp backend/env.example backend/.env
cp env.example .env.local

# 編輯環境變量
nano backend/.env
nano .env.local
```

### 4. 環境變量配置
```env
# backend/.env
# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=octopus_user
DB_PASSWORD=your_secure_password
DB_DATABASE=octopus_payment

# 八達通API配置
OCTOPUS_API_URL=https://api.octopus.com.hk
OCTOPUS_MERCHANT_ID=your_merchant_id
OCTOPUS_SECRET_KEY=your_secret_key
OCTOPUS_WEBHOOK_SECRET=your_webhook_secret

# 應用配置
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

```env
# .env.local
# 前端環境變量
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=八達通支付平台
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 5. 數據庫遷移
```bash
# 運行數據庫遷移
cd backend
npm run migration:run
cd ..
```

### 6. 構建應用
```bash
# 構建前端
npm run build

# 構建後端
cd backend
npm run build
cd ..
```

### 7. PM2配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'octopus-frontend',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    },
    {
      name: 'octopus-backend',
      script: 'npm',
      args: 'start:prod',
      cwd: './backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ]
};
```

### 8. 啟動服務
```bash
# 創建日誌目錄
mkdir -p logs

# 啟動服務
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 設置開機自啟
pm2 startup
```

### 9. Nginx配置
```nginx
# /etc/nginx/sites-available/octopus-payment
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # 安全頭
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 前端代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket代理
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康檢查
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

### 10. 啟用Nginx配置
```bash
# 啟用站點
sudo ln -s /etc/nginx/sites-available/octopus-payment /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重載Nginx
sudo systemctl reload nginx
```

---

## 🔍 部署後檢查

### ✅ 服務檢查
- [ ] 前端服務運行正常 (端口3000)
- [ ] 後端服務運行正常 (端口3001)
- [ ] 數據庫連接正常
- [ ] Nginx代理正常
- [ ] SSL證書有效

### ✅ 功能測試
- [ ] 創建訂單功能正常
- [ ] 支付請求創建正常
- [ ] QR Code生成正常
- [ ] WebSocket連接正常
- [ ] 支付狀態更新正常

### ✅ 八達通API測試
- [ ] API連接正常
- [ ] 簽名驗證正常
- [ ] Webhook接收正常
- [ ] 支付流程完整

### ✅ 性能測試
- [ ] 響應時間 < 2秒
- [ ] 並發處理正常
- [ ] 內存使用正常
- [ ] CPU使用正常

---

## 📊 監控和維護

### 1. 日誌監控
```bash
# 查看PM2日誌
pm2 logs

# 查看Nginx日誌
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看應用日誌
tail -f logs/frontend-combined.log
tail -f logs/backend-combined.log
```

### 2. 性能監控
```bash
# PM2監控
pm2 monit

# 系統資源監控
htop
df -h
free -h
```

### 3. 數據庫監控
```sql
-- 檢查數據庫連接
SELECT count(*) FROM pg_stat_activity;

-- 檢查數據庫大小
SELECT pg_size_pretty(pg_database_size('octopus_payment'));

-- 檢查表大小
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 4. 備份策略
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="octopus_payment"
DB_USER="octopus_user"

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 數據庫備份
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 壓縮備份
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 應用代碼備份
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /path/to/your/app

# 刪除7天前的備份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "備份完成: $DATE"
```

### 5. 自動備份設置
```bash
# 添加到crontab
crontab -e

# 每天凌晨2點備份
0 2 * * * /path/to/backup.sh
```

---

## 🚨 故障排除

### 常見問題解決

#### 1. 服務無法啟動
```bash
# 檢查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# 檢查PM2狀態
pm2 status
pm2 logs

# 重啟服務
pm2 restart all
```

#### 2. 數據庫連接失敗
```bash
# 檢查PostgreSQL狀態
sudo systemctl status postgresql

# 檢查數據庫連接
psql -h localhost -U octopus_user -d octopus_payment -c "SELECT 1;"

# 檢查數據庫日誌
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 3. API調用失敗
```bash
# 檢查API端點
curl -X GET https://your-domain.com/api/health

# 檢查八達通API連接
curl -X GET https://api.octopus.com.hk/health

# 檢查環境變量
pm2 env 0
```

#### 4. WebSocket連接失敗
```bash
# 檢查WebSocket端點
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" https://your-domain.com/socket.io/

# 檢查Nginx配置
sudo nginx -t
```

---

## 📞 技術支持

### 緊急聯繫
- **技術支持**: tech-support@yourcompany.com
- **緊急熱線**: +852-XXXX-XXXX
- **狀態頁面**: https://status.yourcompany.com

### 文檔資源
- **API文檔**: [API參考文檔](./API_REFERENCE.md)
- **快速開始**: [快速開始指南](./QUICK_START_GUIDE.md)
- **完整文檔**: [技術整合指南](./TECHNICAL_INTEGRATION_GUIDE.md)
- **示例代碼**: [GitHub Repository](https://github.com/your-org/octopus-payment-platform)

### 社區支持
- **GitHub Issues**: [問題反饋](https://github.com/your-org/octopus-payment-platform/issues)
- **Discord**: [開發者社區](https://discord.gg/your-discord)
- **Stack Overflow**: [技術問答](https://stackoverflow.com/questions/tagged/octopus-payment)

---

## ✅ 部署完成檢查

### 最終檢查清單
- [ ] 所有服務運行正常
- [ ] 所有功能測試通過
- [ ] 監控系統已設置
- [ ] 備份策略已實施
- [ ] 文檔已更新
- [ ] 團隊已培訓
- [ ] 支持流程已建立

### 上線確認
- [ ] 生產環境已準備就緒
- [ ] 八達通API已配置
- [ ] 客戶已通知
- [ ] 監控已啟動
- [ ] 支持團隊已就位

---

**部署完成！** 🎉

您的八達通O! ePay支付平台已成功部署並準備為客戶提供服務。

**部署日期**: ___________  
**部署人員**: ___________  
**版本號**: v1.0.0  
**環境**: Production
