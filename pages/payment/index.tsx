import { GetServerSideProps } from 'next';
import PaymentPage from './[orderId]';

interface PaymentPageProps {
  orderId: string;
  amount: number;
  description: string;
}

export const getServerSideProps: GetServerSideProps<PaymentPageProps> = async (context) => {
  const { orderId } = context.params as { orderId: string };
  
  try {
    // 從後端獲取訂單信息
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/orders/${orderId}`);
    const result = await response.json();
    
    if (!result.success) {
      return {
        notFound: true,
      };
    }
    
    return {
      props: {
        orderId,
        amount: result.data.amount,
        description: result.data.description,
      },
    };
  } catch (error) {
    console.error('獲取訂單信息錯誤:', error);
    return {
      notFound: true,
    };
  }
};

export default PaymentPage;
