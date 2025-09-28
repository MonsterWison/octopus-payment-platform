@echo off
REM 八達通O! ePay支付平台啟動腳本 (Windows版本)
REM Octopus Payment Platform Startup Script for Windows

echo 🚀 八達通O! ePay支付平台啟動中...
echo ==================================

REM 檢查Node.js
echo 📋 檢查環境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤: 未安裝Node.js，請先安裝Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js版本: 
node --version

echo.
echo 📦 安裝依賴...

REM 安裝前端依賴
echo 安裝前端依賴...
if not exist "node_modules" (
    npm install
) else (
    echo 前端依賴已安裝
)

REM 安裝後端依賴
echo 安裝後端依賴...
if not exist "backend\node_modules" (
    cd backend
    npm install
    cd ..
) else (
    echo 後端依賴已安裝
)

echo.
echo ⚙️ 配置環境變量...

REM 檢查環境變量文件
if not exist "backend\.env" (
    echo 創建後端環境變量文件...
    copy "backend\env.example" "backend\.env"
    echo ✅ 已創建 backend\.env 文件，請編輯其中的數據庫配置
)

if not exist ".env.local" (
    echo 創建前端環境變量文件...
    copy "env.example" ".env.local"
    echo ✅ 已創建 .env.local 文件
)

echo.
echo 🗄️ 數據庫設置...

REM 檢查數據庫遷移
echo 檢查PostgreSQL連接...
cd backend
npm run migration:run >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 數據庫遷移完成
) else (
    echo ⚠️ 數據庫遷移失敗，請檢查PostgreSQL連接和配置
    echo 請確保：
    echo 1. PostgreSQL服務正在運行
    echo 2. 數據庫用戶名和密碼正確
    echo 3. 數據庫 'octopus_payment' 已創建
)
cd ..

echo.
echo 🎯 啟動服務...

REM 啟動後端服務
echo 啟動後端服務 (端口 3001)...
start "後端服務" cmd /k "cd backend && npm run start:dev"

REM 等待後端啟動
echo 等待後端服務啟動...
timeout /t 5 /nobreak >nul

REM 啟動前端服務
echo 啟動前端服務 (端口 3000)...
start "前端服務" cmd /k "npm run dev"

echo.
echo 🎉 服務啟動完成！
echo ==================================
echo 📱 前端服務: http://localhost:3000
echo 🔧 後端API: http://localhost:3001
echo 📖 API文檔: http://localhost:3001/api
echo.
echo 💡 使用說明:
echo 1. 訪問 http://localhost:3000 查看演示頁面
echo 2. 選擇快速支付或自定義支付
echo 3. 在支付頁面可以看到QR Code和付款編號
echo 4. 使用模擬支付功能測試支付流程
echo.
echo 🛑 停止服務: 關閉命令提示符窗口
echo.

pause
