import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'merchant' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshAuthToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    // 從localStorage恢復認證狀態
    const savedToken = localStorage.getItem('auth_token');
    const savedRefreshToken = localStorage.getItem('refresh_token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setRefreshToken(savedRefreshToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const { user: userData, accessToken, refreshToken: newRefreshToken } = result.data;
        
        setUser(userData);
        setToken(accessToken);
        setRefreshToken(newRefreshToken);

        // 保存到localStorage
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('登入成功！');
        return true;
      } else {
        toast.error(result.message || '登入失敗');
        return false;
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      toast.error('登入時發生錯誤');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        const { user: newUser, accessToken, refreshToken: newRefreshToken } = result.data;
        
        setUser(newUser);
        setToken(accessToken);
        setRefreshToken(newRefreshToken);

        // 保存到localStorage
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        toast.success('註冊成功！');
        return true;
      } else {
        toast.error(result.message || '註冊失敗');
        return false;
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      toast.error('註冊時發生錯誤');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    // 清除localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    toast.success('已登出');
    router.push('/');
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (result.success) {
        const { accessToken, refreshToken: newRefreshToken } = result.data;
        
        setToken(accessToken);
        setRefreshToken(newRefreshToken);

        // 更新localStorage
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('刷新令牌錯誤:', error);
      logout();
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!token) {
      toast.error('請先登入');
      return false;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        toast.success('資料更新成功！');
        return true;
      } else {
        toast.error(result.message || '更新失敗');
        return false;
      }
    } catch (error) {
      console.error('更新資料錯誤:', error);
      toast.error('更新資料時發生錯誤');
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!token) {
      toast.error('請先登入');
      return false;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('密碼更改成功！');
        return true;
      } else {
        toast.error(result.message || '密碼更改失敗');
        return false;
      }
    } catch (error) {
      console.error('更改密碼錯誤:', error);
      toast.error('更改密碼時發生錯誤');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshAuthToken,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
