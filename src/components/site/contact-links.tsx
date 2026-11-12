import type { ReactNode } from 'react';
import { SOCIAL_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EmailIcon, SocialIcon, WhatsAppIcon } from './brand-icons';

interface ContactLinksProps {
  /** Layout: round icon buttons, labelled pills, or a vertical list of rows. */
  layout: 'icons' | 'pills' | 'list';
  email?: string;
  /** Digits with country code, e.g. 256700000000. Empty or undefined hides the link. */
  whatsapp?: string;
  /** Include the social profiles from SOCIAL_LINKS (TikTok today). */
  socials?: boolean;
  className?: string;
}

interface Item {
  key: string;
  label: string;
  href: string;
  external: boolean;
  icon: ReactNode;
  /** Tailwind hover colour: each network gets its own, email uses the brand colour. */
  hover: string;
}

/**
 * One place that renders how people can reach us, so the footer, the contact page
 * and the About page always show the same links with the same official glyphs.
 */
export function ContactLinks({ layout, email, whatsapp, socials = false, className }: ContactLinksProps) {
  const items: Item[] = [];

  if (email) {
    items.push({
      key: 'email',
      label: 'Email',
      href: `mailto:${email}`,
      external: false,
      icon: <EmailIcon />,
      hover: 'hover:text-brand-strong',
    });
  }

  const digits = whatsapp?.replace(/[^\d]/g, '') ?? '';
  if (digits.length > 0) {
    items.push({
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/${digits}`,
      external: true,
      icon: <WhatsAppIcon />,
      hover: 'hover:text-[#25D366]',
    });
  }

  if (socials) {
    for (const link of SOCIAL_LINKS) {
      const icon = <SocialIcon label={link.label} />;
      items.push({
        key: link.href,
        label: link.label,
        href: link.href,
        external: true,
        icon,
        hover: 'hover:text-ink',
      });
    }
  }

  if (items.length === 0) return null;

  const external = (item: Item) =>
    item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  if (layout === 'icons') {
    return (
      <ul className={cn('flex flex-wrap gap-2', className)}>
        {items.map((item) => (
          <li key={item.key}>
            <a
              href={item.href}
              aria-label={item.external ? `${item.label} (opens in a new tab)` : item.label}
              title={item.label}
              {...external(item)}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink/[0.06] text-ink',
                'transition-[background-color,color,transform] duration-300 ease-out',
                'hover:-translate-y-0.5 hover:bg-ink/[0.1] active:translate-y-0 active:scale-[0.94]',
                item.hover,
              )}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  if (layout === 'pills') {
    return (
      <ul className={cn('flex flex-wrap justify-center gap-3', className)}>
        {items.map((item) => (
          <li key={item.key}>
            <a
              href={item.href}
              {...external(item)}
              className={cn(
                'inline-flex h-11 items-center gap-2.5 rounded-full bg-ink/[0.06] px-5 text-[0.9375rem] font-medium text-ink',
                'transition-[background-color,color,transform] duration-300 ease-out',
                'hover:-translate-y-0.5 hover:bg-ink/[0.1] active:translate-y-0 active:scale-[0.97]',
                item.hover,
              )}
            >
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn('space-y-1', className)}>
      {items.map((item) => (
        <li key={item.key}>
          <a
            href={item.href}
            {...external(item)}
            className={cn(
              'group -mx-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[1.0625rem] font-medium text-ink',
              'transition-[background-color,color] duration-300 ease-out hover:bg-ink/[0.05]',
              item.hover,
            )}
          >
            <span className="transition-transform duration-300 ease-out group-hover:scale-110">
              {item.icon}
            </span>
            {item.label}
            {item.external && (
              <span
                aria-hidden="true"
                className="ml-auto text-faint transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
