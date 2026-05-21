import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';

const geistSans = localFont({
  src: '../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
  preload: false,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Hometown Hub – Your Digital Community',
    template: '%s | Hometown Hub',
  },
  description: 'Connect with your neighbors, discover local events, and build stronger communities with Hometown Hub.',
  keywords: ['community', 'neighborhood', 'local events', 'social', 'hometown'],
  openGraph: {
    title: 'Hometown Hub',
    description: 'Your digital community platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable}`}>
      <body className="bg-surface-50 text-surface-900 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#292220',
                color: '#f8f7f4',
                borderRadius: '12px',
                border: '1px solid rgba(243, 76, 20, 0.2)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist-sans)',
              },
              success: {
                iconTheme: { primary: '#f34c14', secondary: '#f8f7f4' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f8f7f4' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
