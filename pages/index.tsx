import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CreditCard, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // 自動跳轉到演示頁面
    router.push('/demo');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">八達通O! ePay支付平台</h1>
        <p className="text-gray-600 mb-4">正在載入演示頁面...</p>
        <div className="flex items-center justify-center space-x-2 text-blue-500">
          <ArrowRight className="w-4 h-4 animate-bounce" />
          <span className="text-sm">即將跳轉</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
