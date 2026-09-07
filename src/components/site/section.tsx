import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Vertical rhythm is varied on purpose: not every band gets the same air. */
  space?: 'sm' | 'md' | 'lg';
}

const spacing = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
};

export function Section({ children, className, id, space = 'md' }: SectionProps) {
  return (
    <section id={id} className={cn(spacing[space], className)}>
      <div className="shell">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  as?: 'h1' | 'h2';
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  as = 'h2',
}: SectionHeadingProps) {
  const Heading = as;

  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Heading className="text-display-sm font-semibold text-ink md:text-[2.75rem] md:leading-[1.05] md:tracking-[-0.025em]">
        {title}
      </Heading>
      {lead && <p className="mt-5 text-lg leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}
