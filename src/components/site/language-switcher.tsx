'use client';

import { LANGUAGES } from '@/lib/i18n/messages';
import { cn } from '@/lib/utils';
import { T, useLanguage } from './language-provider';

/**
 * Segmented language control. A highlight slides under the active language using
 * only transform, so the movement stays smooth on low-end phones.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const activeIndex = Math.max(
    0,
    LANGUAGES.findIndex((language) => language.code === lang),
  );

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-xs text-faint">
        <T id="lang.label">Language</T>
      </span>
      <div
        role="group"
        aria-label="Language"
        className="relative grid grid-cols-3 rounded-full bg-ink/[0.06] p-1"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-canvas shadow-sm transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            lang={language.code}
            aria-pressed={lang === language.code}
            title={language.native}
            onClick={() => setLang(language.code)}
            className={cn(
              'relative z-10 h-8 min-w-[2.75rem] rounded-full px-3 text-xs font-medium transition-[color,transform] duration-300 ease-out active:scale-[0.94]',
              lang === language.code ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {language.short}
          </button>
        ))}
      </div>
    </div>
  );
}
