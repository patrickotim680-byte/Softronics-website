import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-dashed border-line bg-surface px-6 py-10 sm:px-10 sm:py-14',
        className,
      )}
    >
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
        Nothing here yet
      </span>
      <h3 className="text-xl font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
