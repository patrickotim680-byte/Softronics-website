import type { ReactNode } from 'react';

/**
 * Unlike a layout, a template is created fresh on every navigation, so the page
 * content fades in each time you move between pages. Opacity only: no movement,
 * so it never fights with the per-section reveal animations.
 */
export default function PublicTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
