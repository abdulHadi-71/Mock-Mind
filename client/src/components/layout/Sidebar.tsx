'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  History,
  Shield,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/brand/Logo';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview/start', label: 'New Interview', icon: Mic },
  { href: '/dashboard#history', label: 'History', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/30">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Logo size="lg" href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href.split('#')[0])
                ? 'bg-white/10 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            prefetch={false}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === '/admin' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
          >
            <Shield className="h-5 w-5" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={toggle}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-xs text-slate-300 hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center justify-center rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
