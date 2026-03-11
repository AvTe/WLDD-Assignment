import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = ['/login', '/signup'].includes(router.pathname);
  const isFullLayoutPage = ['/', '/dashboard'].includes(router.pathname);

  return (
    <ThemeProvider>
      <AuthProvider>
        {isAuthPage || isFullLayoutPage ? (
          <Component {...pageProps} />
        ) : (
          <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-200">
            <Navbar />
            <main>
              <Component {...pageProps} />
            </main>
          </div>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}
