import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/constants';

/** Quiet, tinted pills: sentence case, no outline, no code-style capitals. */
const tones: Record<Tone, string> = {
  neutral: 'bg-ink/[0.06] text-muted',
  blue: 'bg-brand/[0.09] text-brand-strong',
  green: 'bg-signal-green/[0.12] text-[oklch(0.44_0.12_155)]',
  amber: 'bg-signal-amber/[0.16] text-[oklch(0.47_0.1_70)]',
  violet: 'bg-signal-violet/[0.1] text-[oklch(0.46_0.15_296)]',
  red: 'bg-signal-red/[0.1] text-signal-red',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** Adds a small filled dot, useful for live/status meanings. */
  dot?: boolean;
}

export function Badge({ children, tone = 'neutral', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-[-0.005em]',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
