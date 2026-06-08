'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/#features', label: 'Features' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/#features') return pathname === '/';
    if (href.startsWith('/#')) return pathname === '/';
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] animate-slide-down">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:h-[4.75rem] sm:px-6 lg:px-8">
        <Logo size="xl" href="/" className="shrink-0 transition-all duration-300 hover:scale-[1.05] hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" />

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map(({ href, label }, idx) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive(href)
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white hover:shadow-md'
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              prefetch={false}
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30 active:translate-y-0"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                prefetch={false}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white hover:shadow-md"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                prefetch={false}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30 active:translate-y-0"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-200 transition-all duration-200 hover:bg-white/10 hover:shadow-md md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {publicLinks.map(({ href, label }, idx) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive(href)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
