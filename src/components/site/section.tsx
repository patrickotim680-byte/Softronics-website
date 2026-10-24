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
  sm: 'py-14 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-24 md:py-36',
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
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  as = 'h2',
  align = 'left',
}: SectionHeadingProps) {
  const Heading = as;
  const centered = align === 'center';

  return (
    <div className={cn('max-w-3xl', centered && 'mx-auto text-center', className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Heading className="text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.03em] text-ink md:text-[3.5rem]">
        {title}
      </Heading>
      {lead && (
        <p
          className={cn(
            'mt-5 text-lg leading-relaxed text-muted md:text-xl md:leading-[1.5]',
            centered && 'mx-auto max-w-2xl',
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
