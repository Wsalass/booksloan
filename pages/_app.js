import Head from 'next/head';
import { AuthProvider } from '../hooks/AuthContext';
import Header from '../components/Header';
import { ToastContainer } from 'react-toastify';
import Footer from '../components/Footer'
import NotificationSection from '../components/NotificationSection';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <title>bookloan</title>
        <meta name="description" content="BookLoan" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <NotificationSection />
        <main className="flex-grow">
          <Component {...pageProps} />
          <ToastContainer />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default MyApp;

