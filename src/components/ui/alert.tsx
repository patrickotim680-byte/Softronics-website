import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type AlertTone = 'info' | 'success' | 'warning' | 'error';

const tones: Record<AlertTone, string> = {
  info: 'bg-brand/[0.07] text-ink',
  success: 'bg-signal-green/[0.1] text-ink',
  warning: 'bg-signal-amber/[0.13] text-ink',
  error: 'bg-signal-red/[0.08] text-ink',
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
      className={cn('rounded-2xl px-5 py-4 text-sm leading-relaxed', tones[tone], className)}
    >
      <p className="mb-1 text-sm font-semibold text-ink">
        {title ?? labels[tone]}
      </p>
      <div className="[&_a]:font-medium [&_a]:text-brand-strong [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
