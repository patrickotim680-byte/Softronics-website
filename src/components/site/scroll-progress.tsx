'use client';

import { useEffect, useRef } from 'react';

/**
 * A hairline at the very top of the page that fills as you read down it.
 * It only ever changes `transform: scaleX`, which the browser can animate on the GPU
 * without re-laying-out the page, and scroll events are coalesced with
 * requestAnimationFrame so it never does more than one update per frame.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bar.current;
    if (!node) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      node.style.transform = `scaleX(${progress})`;
      node.style.opacity = progress > 0.005 ? '1' : '0';
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div
        ref={bar}
        className="h-full origin-left bg-brand opacity-0 transition-opacity duration-300"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
