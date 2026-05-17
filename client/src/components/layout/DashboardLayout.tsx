'use client';

import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
