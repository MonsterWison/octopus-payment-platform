import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw, Smartphone, Copy } from 'lucide-react';

interface PaymentData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  qrCodeData: string;
  createdAt: string;
  completedAt?: string;
}

interface PaymentPageProps {
  orderId: string;
  amount: number;
  description: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ orderId, amount, description }) => {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5分鐘倒計時

  useEffect(() => {
    // 初始化WebSocket連接
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // 監聽支付狀態更新
    newSocket.on('paymentUpdate', (data) => {
      if (data.paymentId === payment?.id) {
        setPayment(prev => prev ? { ...prev, ...data } : null);
        
        if (data.status === 'completed') {
          toast.success('支付成功！');
          setIsPolling(false);
        } else if (data.status === 'failed') {
          toast.error('支付失敗，請重試');
          setIsPolling(false);
        }
      }
    });

    return () => {
      newSocket.close();
    };
  }, [payment?.id]);

  useEffect(() => {
    createPayment();
  }, []);

  useEffect(() => {
    if (payment?.qrCodeData) {
      generateQRCode();
      extractPaymentToken();
    }
  }, [payment?.qrCodeData]);

  useEffect(() => {
    if (payment && payment.status === 'pending' && !isPolling) {
      startPolling();
      startCountdown();
    }
  }, [payment]);

  // 倒計時功能
  useEffect(() => {
    if (timeRemaining > 0 && payment?.status === 'pending') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      toast.error('支付時間已過期，請重新創建訂單');
    }
  }, [timeRemaining, payment?.status]);

  const createPayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'HKD',
          method: 'octopus_qr',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPayment(result.data);
        toast.success('支付請求已創建');
      } else {
        toast.error(result.message || '創建支付請求失敗');
      }
    } catch (error) {
      console.error('創建支付請求錯誤:', error);
      toast.error('網絡錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!payment?.qrCodeData) return;

    try {
      const qrData = JSON.parse(payment.qrCodeData);
      // 使用八達通官方URL格式生成QR Code
      const qrUrl = await QRCode.toDataURL(qrData.url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('生成QR Code錯誤:', error);
      toast.error('生成QR Code失敗');
    }
  };

  const extractPaymentToken = () => {
    if (!payment?.qrCodeData) return;
    
    try {
      const qrData = JSON.parse(payment.qrCodeData);
      setPaymentToken(qrData.token);
    } catch (error) {
      console.error('提取付款編號錯誤:', error);
    }
  };

  const copyPaymentToken = () => {
    navigator.clipboard.writeText(paymentToken);
    toast.success('付款編號已複製到剪貼板');
  };

  const startPolling = () => {
    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      if (!payment) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/payments/${payment.id}`);
        const result = await response.json();
        
        if (result.success && result.data.status !== payment.status) {
          setPayment(result.data);
          
          if (result.data.status === 'completed') {
            clearInterval(pollInterval);
            setIsPolling(false);
            toast.success('支付成功！');
          } else if (result.data.status === 'failed') {
            clearInterval(pollInterval);
            setIsPolling(false);
            toast.error('支付失敗');
          }
        }
      } catch (error) {
        console.error('輪詢支付狀態錯誤:', error);
      }
    }, 3000); // 每3秒輪詢一次

    // 5分鐘後停止輪詢
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
    }, 300000);
  };

  const startCountdown = () => {
    setTimeRemaining(300); // 5分鐘
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const simulatePayment = async () => {
    if (!payment) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/payments/${payment.id}/simulate`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        setPayment(result.data);
        toast.success('模擬支付完成');
      } else {
        toast.error(result.message || '模擬支付失敗');
      }
    } catch (error) {
      console.error('模擬支付錯誤:', error);
      toast.error('模擬支付失敗');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待支付';
      case 'processing':
        return '處理中';
      case 'completed':
        return '支付成功';
      case 'failed':
        return '支付失敗';
      case 'cancelled':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在創建支付請求...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* 標題和倒計時 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">八達通網上付款服務</h1>
              <p className="text-sm text-gray-600">多謝使用八達通網上付款服務</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">尚餘時間</p>
            <p className="text-lg font-bold text-red-500">{formatTime(timeRemaining)}</p>
          </div>
        </div>

        {/* 重要提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800 font-medium">
            <strong>重要：</strong>請勿關閉或離開此網頁，它會在付款狀態改變時自動更新。
          </p>
        </div>

        {/* 支付詳情 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">付款詳情</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">商戶名稱</span>
              <span className="font-medium">測試商戶</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">金額</span>
              <span className="font-bold text-blue-600">HKD {amount.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">商品描述</span>
              <span className="font-medium">{description}</span>
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">透過八達通App使用八達通卡或八達通銀包付款</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            如你的流動裝置已下載八達通App，可選擇以下付款方法：
          </p>
          
          <ul className="text-sm text-gray-600 mb-4 space-y-1">
            <li>• 八達通卡</li>
            <li>• 八達通銀包</li>
          </ul>

          <p className="text-sm text-gray-600 mb-4">
            請開啟八達通App，並掃瞄以下QR Code或輸入以下付款編號。
          </p>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">掃描QR Code，或</p>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img src={qrCodeUrl} alt="支付QR Code" className="mx-auto" />
              </div>
            </div>
          )}

          {/* 付款編號 */}
          {paymentToken && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">輸入付款編號</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-gray-900 font-mono">{paymentToken}</span>
                <button
                  onClick={copyPaymentToken}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 支付狀態 */}
        {payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              {getStatusIcon(payment.status)}
              <span className="font-medium text-gray-900">
                {getStatusText(payment.status)}
              </span>
            </div>
            
            {isPolling && (
              <p className="text-sm text-gray-600 text-center mt-2">
                正在等待支付確認...
              </p>
            )}
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="space-y-3">
          {payment?.status === 'pending' && (
            <button
              onClick={simulatePayment}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              模擬支付成功（測試用）
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            取消交易
          </button>
        </div>

        {/* 支付說明 */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">支付說明：</h3>
          <ul className="space-y-1">
            <li>• 請確保您的八達通App已更新至最新版本</li>
            <li>• 掃描QR Code後請在App中確認支付</li>
            <li>• 支付完成後頁面會自動更新狀態</li>
            <li>• 如有問題請聯繫客服</li>
          </ul>
        </div>

        {/* 版權信息 */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          © 2024 八達通卡有限公司。版權所有。
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
