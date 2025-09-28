import React, { useState } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCart, CreditCard, ArrowRight, Smartphone, QrCode, Clock } from 'lucide-react';

const DemoPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: 'MyTV Super 月費',
    amount: '78.0',
    customerEmail: '',
    customerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      toast.error('請填寫所有必填欄位');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('請輸入有效的金額');
      return;
    }

    setIsLoading(true);

    try {
      // 創建訂單
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          amount: amount,
          currency: 'HKD',
          customerEmail: formData.customerEmail || undefined,
          customerPhone: formData.customerPhone || undefined,
        }),
      });

      const orderResult = await orderResponse.json();
      
      if (orderResult.success) {
        toast.success('訂單已創建');
        // 跳轉到支付頁面
        router.push(`/payment/${orderResult.data.id}`);
      } else {
        toast.error(orderResult.message || '創建訂單失敗');
      }
    } catch (error) {
      console.error('創建訂單錯誤:', error);
      toast.error('網絡錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const quickPayments = [
    { description: 'MyTV Super 月費', amount: 78.0 },
    { description: 'Netflix 月費', amount: 93.0 },
    { description: 'Spotify 月費', amount: 48.0 },
    { description: 'Apple Music 月費', amount: 58.0 },
  ];

  const handleQuickPayment = (item: { description: string; amount: number }) => {
    setFormData(prev => ({
      ...prev,
      description: item.description,
      amount: item.amount.toString(),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4">
        {/* 標題區域 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">八達通O! ePay支付平台</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">安全便捷的QR Code支付解決方案</p>
          <p className="text-sm text-gray-500">基於官方八達通支付頁面設計，完全模擬真實支付體驗</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 左側：快速支付 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-blue-500" />
              快速支付
            </h2>
            
            <div className="space-y-3 mb-6">
              {quickPayments.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPayment(item)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.description}</span>
                    <span className="text-blue-600 font-bold">HKD ${item.amount}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">支付特色</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 完全模擬八達通官方支付頁面</li>
                <li>• 支持QR Code掃描和付款編號輸入</li>
                <li>• 實時支付狀態更新</li>
                <li>• 5分鐘倒計時功能</li>
                <li>• 自動狀態輪詢</li>
              </ul>
            </div>
          </div>

          {/* 右側：自定義支付 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2 text-green-500" />
              自定義支付
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 商品描述 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  商品描述 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="請描述您要購買的商品或服務"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              {/* 金額 */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  金額 (HKD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    min="0.1"
                    step="0.1"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* 客戶郵箱 */}
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  客戶郵箱
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 客戶電話 */}
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  客戶電話
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="+852 1234 5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 提交按鈕 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>創建中...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>創建訂單並支付</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 技術特色 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">技術特色</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">QR Code生成</h3>
              <p className="text-sm text-gray-600">基於八達通官方格式生成QR Code，支持掃描和付款編號輸入</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">實時更新</h3>
              <p className="text-sm text-gray-600">WebSocket實時通信，支付狀態自動更新，無需手動刷新</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">響應式設計</h3>
              <p className="text-sm text-gray-600">完全響應式設計，支持桌面和移動設備，完美模擬官方體驗</p>
            </div>
          </div>
        </div>

        {/* 版權信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 八達通O! ePay支付平台演示版本</p>
          <p className="mt-1">基於八達通官方支付頁面設計，僅供技術演示使用</p>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
