import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { Toaster } from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <Toaster position="top-right" />
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

export default AuthPage;
