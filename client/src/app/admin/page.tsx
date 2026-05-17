'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    Promise.all([
      api.get<{ success: boolean; data: Record<string, unknown> }>('/admin/analytics'),
      api.get<{ success: boolean; data: Array<Record<string, unknown>> }>('/admin/users'),
    ]).then(([a, u]) => {
      setAnalytics(a.data);
      setUsers(u.data);
    });
  }, [user, router]);

  if (user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
      <p className="text-slate-500">System monitoring and user management</p>

      {analytics && (
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Card label="Total Users" value={String(analytics.totalUsers)} />
          <Card label="Total Interviews" value={String(analytics.totalInterviews)} />
          <Card label="Completed" value={String(analytics.completedInterviews)} />
          <Card label="Avg Score" value={`${analytics.averageScore}%`} />
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={String(u._id)} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3">{String(u.name)}</td>
                  <td className="px-4 py-3">{String(u.email)}</td>
                  <td className="px-4 py-3 capitalize">{String(u.role)}</td>
                  <td className="px-4 py-3">{new Date(String(u.createdAt)).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
