'use client';

import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 py-4 px-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>&copy; 2024 MockMind. Keep practicing to get better. Good luck! 🚀</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
