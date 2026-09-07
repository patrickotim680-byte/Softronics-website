'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ADMIN_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/site/logo';

interface SidebarProps {
  unreadCount: number;
  canManageTeam: boolean;
  children: ReactNode;
}

/**
 * Admin navigation. On desktop it is a persistent rail; on small screens it
 * collapses into a slide-over so the content area keeps full width.
 */
export function AdminSidebar({ unreadCount, canManageTeam, children }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = ADMIN_NAV.filter((item) => item.href !== '/admin/team' || canManageTeam);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-0.5">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
          className={cn(
            'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-150',
            isActive(item.href, item.exact)
              ? 'bg-white/[0.08] font-medium text-white'
              : 'text-deep-text/70 hover:bg-white/[0.04] hover:text-white',
          )}
        >
          {item.label}
          {item.href === '/admin/messages' && unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-brand px-2 py-0.5 font-mono text-[0.6875rem] text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-deep-line bg-deep px-4 lg:hidden">
        <Logo onDark size={26} />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="rounded-md border border-deep-line px-3 py-1.5 text-sm text-deep-text"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div id="admin-nav" className="border-b border-deep-line bg-deep p-4 lg:hidden">
          {nav}
        </div>
      )}

      {/* Desktop rail */}
      <aside className="hidden border-r border-deep-line bg-deep lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b border-deep-line px-5 py-5">
          <Logo onDark size={28} />
          <p className="mt-1 pl-[2.375rem] font-mono text-[0.625rem] uppercase tracking-[0.14em] text-deep-text/45">
            CMS
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="border-t border-deep-line p-3">
          <Link
            href="/"
            target="_blank"
            className="block rounded-md px-3 py-2 text-sm text-deep-text/70 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            View website ↗
          </Link>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
