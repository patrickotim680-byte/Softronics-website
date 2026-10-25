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
        'flex flex-col items-center gap-3 rounded-[1.75rem] bg-surface px-6 py-12 text-center shadow-[0_0_0_1px_oklch(var(--ink)/0.05)] sm:px-10 sm:py-16',
        className,
      )}
    >
      <h3 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">{title}</h3>
      <p className="max-w-md text-[1.0625rem] leading-relaxed text-muted">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
