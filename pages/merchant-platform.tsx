import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface MerchantPlatformStats {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  apiUsage: {
    requests: number;
    limit: number;
    resetDate: string;
  };
}

interface MerchantInfo {
  merchantId: string;
  businessName: string;
  status: string;
  registrationDate: string;
  lastSyncDate: string;
}

const OctopusMerchantPlatformIntegration: React.FC = () => {
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null);
  const [stats, setStats] = useState<MerchantPlatformStats | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    checkConnection();
    loadMerchantInfo();
    loadStats();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/merchant-platform/verify-connection');
      const result = await response.json();
      setIsConnected(result.connected);
    } catch (error) {
      console.error('檢查連接失敗:', error);
      setIsConnected(false);
    }
  };

  const loadMerchantInfo = async () => {
    try {
      const response = await fetch('/api/merchant-platform/merchant-info');
      const result = await response.json();
      if (result.success) {
        setMerchantInfo(result.data);
      }
    } catch (error) {
      console.error('獲取商戶信息失敗:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/merchant-platform/api-usage');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('獲取統計信息失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithPlatform = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/merchant-platform/sync-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 同步最近的交易數據
          syncType: 'recent',
          limit: 100
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setLastSync(new Date().toLocaleString());
        await loadStats();
      }
    } catch (error) {
      console.error('同步失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'suspended':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '正常運營';
      case 'suspended':
        return '已暫停';
      case 'pending':
        return '待審核';
      default:
        return '未知狀態';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 標題區域 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">八達通商戶平台整合</h1>
        </div>
        <p className="text-gray-600">
          與八達通官方商戶平台 (mp.octopuscards.com) 的整合狀態和數據同步
        </p>
      </div>

      {/* 連接狀態 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium text-gray-900">
              {isConnected ? '已連接' : '連接失敗'}
            </span>
            <span className="text-sm text-gray-500">
              八達通商戶平台
            </span>
          </div>
          <button
            onClick={checkConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重新檢查</span>
          </button>
        </div>
      </div>

      {/* 商戶信息 */}
      {merchantInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-blue-500" />
            商戶信息
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">商戶ID</span>
                <span className="font-medium">{merchantInfo.merchantId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">商戶名稱</span>
                <span className="font-medium">{merchantInfo.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">註冊日期</span>
                <span className="font-medium">
                  {new Date(merchantInfo.registrationDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">狀態</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(merchantInfo.status)}
                  <span className="font-medium">
                    {getStatusText(merchantInfo.status)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最後同步</span>
                <span className="font-medium">
                  {merchantInfo.lastSyncDate ? 
                    new Date(merchantInfo.lastSyncDate).toLocaleString() : 
                    '從未同步'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 統計信息 */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總交易數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總交易金額</p>
                <p className="text-2xl font-bold text-gray-900">
                  HKD ${stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成功率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successRate.toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API使用量</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.apiUsage.requests}/{stats.apiUsage.limit}
                </p>
                <p className="text-xs text-gray-500">
                  重置: {new Date(stats.apiUsage.resetDate).toLocaleDateString()}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* 操作區域 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">平台操作</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={syncWithPlatform}
            disabled={isLoading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>同步數據</span>
          </button>

          <button
            onClick={() => window.open('https://mp.octopuscards.com/home', '_blank')}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Building2 className="w-5 h-5" />
            <span>訪問商戶平台</span>
          </button>

          <button
            onClick={loadStats}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>刷新統計</span>
          </button>
        </div>

        {lastSync && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>最後同步時間:</strong> {lastSync}
            </p>
          </div>
        )}
      </div>

      {/* 整合說明 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">整合說明</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• 本系統已與八達通官方商戶平台 (mp.octopuscards.com) 完全整合</li>
          <li>• 所有交易數據會自動同步到商戶平台</li>
          <li>• 支持實時狀態更新和財務報表生成</li>
          <li>• 提供完整的API使用統計和監控</li>
          <li>• 支持Webhook通知和事件處理</li>
        </ul>
      </div>
    </div>
  );
};

export default OctopusMerchantPlatformIntegration;
