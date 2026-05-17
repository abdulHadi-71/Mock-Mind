'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/brand/Logo';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      router.replace('/login?error=google_auth_failed');
      return;
    }

    api.setAccessToken(token);
    refreshUser()
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login?error=google_auth_failed'));
  }, [searchParams, router, refreshUser]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <p className="text-sm text-slate-500">Signing you in…</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo size="xl" showText={false} href={undefined} />
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
