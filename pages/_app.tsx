import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../components/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>八達通O! ePay支付平台</title>
        <meta name="description" content="安全便捷的八達通QR Code支付解決方案" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
