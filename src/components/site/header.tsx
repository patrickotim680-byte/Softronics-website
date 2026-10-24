'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MAIN_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

/**
 * Site header: a slim frosted-glass bar. The blur lives on its own background
 * layer, not on the header itself, because a backdrop filter would trap the
 * fixed full-screen mobile menu inside the bar's own height.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 border-b bg-canvas/[0.72] backdrop-blur-xl backdrop-saturate-150 transition-[border-color,background-color] duration-500 ease-out',
          scrolled || open ? 'border-ink/[0.08]' : 'border-transparent',
        )}
      />

      <div className="shell flex h-14 items-center justify-between gap-4 md:h-[3.25rem]">
        <Logo size={28} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-colors duration-300 ease-out',
                isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="inline-flex h-8 items-center rounded-full bg-brand px-4 text-[0.8125rem] font-medium text-white transition-[background-color,transform] duration-300 ease-out hover:bg-brand-strong active:scale-[0.96]"
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
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
        >
          <span className="relative block h-3 w-[18px]" aria-hidden="true">
            <span
              className={cn(
                'absolute left-0 h-[1.5px] w-[18px] bg-current transition-all duration-500 ease-out',
                open ? 'top-[5px] rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 h-[1.5px] w-[18px] bg-current transition-all duration-500 ease-out',
                open ? 'top-[5px] -rotate-45' : 'top-[10px]',
              )}
            />
          </span>
        </button>
      </div>

      {/* Always mounted so it can fade and slide; `invisible` keeps it out of the tab order when closed. */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={cn(
          'fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col overflow-y-auto bg-canvas/[0.94] backdrop-blur-2xl transition-[opacity,transform,visibility] duration-500 ease-out md:hidden',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col px-5 pt-4">
          {MAIN_NAV.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              style={{ transitionDelay: open ? `${90 + index * 50}ms` : '0ms' }}
              className={cn(
                'border-b border-ink/[0.07] py-4 text-[1.75rem] font-semibold tracking-[-0.025em] transition-[opacity,transform,color] duration-700 ease-out',
                isActive(item.href) ? 'text-brand-strong' : 'text-ink',
                open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          style={{ transitionDelay: open ? '380ms' : '0ms' }}
          className={cn(
            'mt-auto p-5 transition-[opacity,transform] duration-700 ease-out',
            open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
        >
          <Link
            href="/contact"
            className="flex h-[3.25rem] items-center justify-center rounded-full bg-brand text-[1.0625rem] font-medium text-white transition-transform duration-300 ease-out active:scale-[0.97]"
          >
            Talk to Softronics
          </Link>
        </div>
      </div>
    </header>
  );
}
