import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-200">
          <Navbar />
          <main>
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
