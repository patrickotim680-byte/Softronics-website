import Link from 'next/link';

interface StatProps {
  label: string;
  value: string | number;
  detail?: string;
  href?: string;
}

/**
 * Compact metric. Deliberately typographic rather than a big-number hero tile:
 * these are working counts, not marketing figures.
 */
export function Stat({ label, value, detail, href }: StatProps) {
  const body = (
    <>
      <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">{label}</dt>
      <dd className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-[-0.02em] text-ink">{value}</span>
        {detail && <span className="text-xs text-muted">{detail}</span>}
      </dd>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-line bg-surface p-5 transition-colors duration-150 hover:border-ink/25"
      >
        <dl>{body}</dl>
      </Link>
    );
  }

  return (
    <dl className="rounded-lg border border-line bg-surface p-5">{body}</dl>
  );
}
