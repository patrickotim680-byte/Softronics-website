'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MAIN_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

/**
 * Site header. Mobile gets a full-height panel rather than a cramped dropdown,
 * because the phone layout is the primary target, not a shrunken desktop nav.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-[2px]">
      <div className="shell flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'relative rounded-md px-3 py-2 text-[0.9375rem] transition-colors duration-150 ease-out',
                isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-[1.35rem] h-[2px] bg-brand md:-bottom-[1.6rem]"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-brand-strong"
          >
            Talk to Softronics
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink md:hidden"
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span
              className={cn(
                'absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ease-out',
                open ? 'top-[7px] rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 top-[7px] h-[1.5px] w-5 bg-current transition-opacity duration-200',
                open ? 'opacity-0' : 'opacity-100',
              )}
            />
            <span
              className={cn(
                'absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ease-out',
                open ? 'top-[7px] -rotate-45' : 'top-[14px]',
              )}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto border-t border-line bg-canvas md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col divide-y divide-hairline">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex items-baseline justify-between px-5 py-5 text-xl tracking-[-0.015em]',
                  isActive(item.href) ? 'text-brand-strong' : 'text-ink',
                )}
              >
                {item.label}
                <span className="font-mono text-[0.6875rem] text-faint">{item.href}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-line p-5">
            <Link
              href="/contact"
              className="flex h-12 items-center justify-center rounded-md bg-brand text-base font-medium text-white"
            >
              Talk to Softronics
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
