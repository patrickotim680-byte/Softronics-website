'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, MESSAGES, type LanguageCode } from '@/lib/i18n/messages';

const STORAGE_KEY = 'softronics-lang';

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  /** Looks up a translation; falls back to the English text written in the code. */
  t: (id: string, fallback: ReactNode) => ReactNode;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  t: (_id, fallback) => fallback,
});

function isLanguage(value: string | null): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}

/**
 * Keeps the visitor's chosen language. The server always renders English (so pages
 * stay fast and cacheable); after the page loads we read the saved choice and swap
 * the text. Reading localStorage can throw in private windows, so it is wrapped.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(saved)) setLangState(saved);
    } catch {
      /* storage unavailable: stay on English */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* the choice still applies for this visit */
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (id, fallback) => (lang === 'en' ? fallback : (MESSAGES[lang][id] ?? fallback)),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Wraps a piece of English text with a translation id:
 *   <T id="nav.about">About</T>
 * Works inside server components too, because only this tiny leaf is a client component.
 */
export function T({ id, children }: { id: string; children: ReactNode }) {
  const { t } = useLanguage();
  return <>{t(id, children)}</>;
}
