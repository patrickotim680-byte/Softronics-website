'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * "Explode and reveal": the cards start piled on top of each other and spread
 * out into the grid as you scroll them into view (scroll back up and they gather
 * again). Scroll position is turned into a single number, --p, from 0 (stacked)
 * to 1 (fully spread). The CSS in globals.css (.explode) turns --p into movement,
 * so JavaScript only does one tiny thing per frame: write one variable.
 *
 * Without JavaScript, or with "reduce motion" on, --p stays at 1: a normal grid.
 */
export function ExplodeGrid({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top } = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the grid's top edge is near the bottom of the screen, 1 once it has risen ~half way.
      const raw = (vh * 0.9 - top) / (vh * 0.5);
      const clamped = Math.min(1, Math.max(0, raw));
      const eased = clamped * clamped * (3 - 2 * clamped); // smoothstep: gentle start and finish
      node.style.setProperty('--p', eased.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul ref={ref} className={cn('explode', className)}>
      {children}
    </ul>
  );
}
