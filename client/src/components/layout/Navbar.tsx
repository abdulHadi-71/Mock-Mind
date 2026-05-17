'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/brand/Logo';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo
          size="lg"
          showText
          href={isAuthenticated ? '/dashboard' : '/'}
          className="transition-transform duration-200 hover:scale-[1.01]"
        />

        <nav className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                prefetch={false}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/interviews/new"
                prefetch={false}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                New Interview
              </Link>
              <span className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-400">
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="rounded-full">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
