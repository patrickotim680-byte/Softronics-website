import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/constants';

const tones: Record<Tone, string> = {
  neutral: 'border-line bg-raised text-muted',
  blue: 'border-brand/25 bg-brand/[0.07] text-brand-strong',
  green: 'border-signal-green/30 bg-signal-green/[0.09] text-[oklch(0.46_0.13_155)]',
  amber: 'border-signal-amber/35 bg-signal-amber/[0.12] text-[oklch(0.49_0.11_70)]',
  violet: 'border-signal-violet/25 bg-signal-violet/[0.08] text-[oklch(0.47_0.16_296)]',
  red: 'border-signal-red/30 bg-signal-red/[0.08] text-signal-red',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em]',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
