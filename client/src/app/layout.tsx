import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIMI — AI Mock Interview Platform',
  description: 'Practice interviews with AI-powered feedback and performance tracking',
  icons: {
    icon: '/aimi-logo.png',
    shortcut: '/aimi-logo.png',
    apple: '/aimi-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
