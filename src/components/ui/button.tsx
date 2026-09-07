import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-out disabled:pointer-events-none disabled:opacity-55';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-strong active:bg-brand-strong shadow-[0_1px_2px_oklch(var(--brand-strong)/0.35)]',
  secondary: 'border border-line bg-surface text-ink hover:border-ink/30 hover:bg-raised',
  ghost: 'text-ink hover:bg-raised',
  danger: 'border border-signal-red/40 text-signal-red hover:bg-signal-red/10',
  onDark: 'border border-deep-line bg-transparent text-deep-text hover:border-brand-bright hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
