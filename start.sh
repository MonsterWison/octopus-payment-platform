#!/bin/bash

# 八達通O! ePay支付平台啟動腳本
# Octopus Payment Platform Startup Script

echo "🚀 八達通O! ePay支付平台啟動中..."
echo "=================================="

# 檢查Node.js版本
echo "📋 檢查環境..."
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 未安裝Node.js，請先安裝Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 錯誤: Node.js版本過低，需要18+，當前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 檢查PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  警告: 未檢測到PostgreSQL，請確保PostgreSQL已安裝並運行"
fi

echo ""
echo "📦 安裝依賴..."

# 安裝前端依賴
echo "安裝前端依賴..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "前端依賴已安裝"
fi

# 安裝後端依賴
echo "安裝後端依賴..."
if [ ! -d "backend/node_modules" ]; then
    cd backend && npm install && cd ..
else
    echo "後端依賴已安裝"
fi

echo ""
echo "⚙️  配置環境變量..."

# 檢查環境變量文件
if [ ! -f "backend/.env" ]; then
    echo "創建後端環境變量文件..."
    cp backend/env.example backend/.env
    echo "✅ 已創建 backend/.env 文件，請編輯其中的數據庫配置"
fi

if [ ! -f ".env.local" ]; then
    echo "創建前端環境變量文件..."
    cp env.example .env.local
    echo "✅ 已創建 .env.local 文件"
fi

echo ""
echo "🗄️  數據庫設置..."

# 檢查數據庫連接
echo "檢查PostgreSQL連接..."
cd backend
if npm run migration:run 2>/dev/null; then
    echo "✅ 數據庫遷移完成"
else
    echo "⚠️  數據庫遷移失敗，請檢查PostgreSQL連接和配置"
    echo "請確保："
    echo "1. PostgreSQL服務正在運行"
    echo "2. 數據庫用戶名和密碼正確"
    echo "3. 數據庫 'octopus_payment' 已創建"
fi
cd ..

echo ""
echo "🎯 啟動服務..."

# 啟動後端服務
echo "啟動後端服務 (端口 3001)..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# 等待後端啟動
echo "等待後端服務啟動..."
sleep 5

# 啟動前端服務
echo "啟動前端服務 (端口 3000)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 服務啟動完成！"
echo "=================================="
echo "📱 前端服務: http://localhost:3000"
echo "🔧 後端API: http://localhost:3001"
echo "📖 API文檔: http://localhost:3001/api"
echo ""
echo "💡 使用說明:"
echo "1. 訪問 http://localhost:3000 查看演示頁面"
echo "2. 選擇快速支付或自定義支付"
echo "3. 在支付頁面可以看到QR Code和付款編號"
echo "4. 使用模擬支付功能測試支付流程"
echo ""
echo "🛑 停止服務: 按 Ctrl+C"
echo ""

# 等待用戶中斷
trap "echo ''; echo '🛑 正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服務已停止'; exit 0" INT

# 保持腳本運行
wait
