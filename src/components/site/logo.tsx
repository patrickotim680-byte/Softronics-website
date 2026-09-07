import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Text colour context. The mark itself is unchanged in both cases. */
  onDark?: boolean;
  href?: string | null;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * The official Softronics mark. Served from /public/brand and never recoloured
 * or redrawn: only the accompanying wordmark adapts to the background.
 */
export function Logo({
  onDark = false,
  href = '/',
  size = 34,
  showWordmark = true,
  className,
}: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/softronics-mark.png"
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span
          className={cn(
            'text-[1.0625rem] font-semibold tracking-[-0.02em]',
            onDark ? 'text-white' : 'text-ink',
          )}
        >
          Softronics
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center rounded-sm" aria-label="Softronics home">
      {content}
    </Link>
  );
}
