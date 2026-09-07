import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type AlertTone = 'info' | 'success' | 'warning' | 'error';

const tones: Record<AlertTone, string> = {
  info: 'border-brand/25 bg-brand/[0.05] text-ink',
  success: 'border-signal-green/30 bg-signal-green/[0.07] text-ink',
  warning: 'border-signal-amber/35 bg-signal-amber/[0.09] text-ink',
  error: 'border-signal-red/30 bg-signal-red/[0.06] text-ink',
};

const labels: Record<AlertTone, string> = {
  info: 'Note',
  success: 'Done',
  warning: 'Heads up',
  error: 'Problem',
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-4 py-3 text-sm leading-relaxed', tones[tone], className)}
    >
      <p className="mb-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
        {title ?? labels[tone]}
      </p>
      <div className="[&_a]:font-medium [&_a]:text-brand-strong [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
