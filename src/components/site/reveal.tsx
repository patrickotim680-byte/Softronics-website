'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Milliseconds to wait before this element animates in. Use it to stagger siblings. */
  delay?: number;
}

/**
 * Fades and lifts its children into view the first time they scroll on screen.
 * Uses only opacity and transform, so it stays on the GPU and never causes
 * layout shift. Reduced-motion users get the content instantly (see globals.css).
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = { transitionDelay: shown ? `${delay}ms` : '0ms' };

  return (
    <div
      ref={ref}
      data-reveal
      style={style}
      className={cn(
        'transition-[opacity,transform] duration-[900ms] ease-out will-change-[opacity,transform]',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
