import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** URL-safe slug. Deterministic, ASCII only, collapses repeated separators. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function formatDate(value: string | Date | null | undefined, locale = 'en-GB'): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined, locale = 'en-GB'): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Value for <input type="datetime-local"> from an ISO timestamp. */
export function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function truncate(input: string, max = 160): string {
  const clean = input.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Strips Markdown syntax so text can be used in meta descriptions. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseFeatureList(input: string): string[] {
  return input
    .split('\n')
    .map((line) => line.replace(/^[-*\u2022]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 24);
}

export function parseTagList(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  );
}

export function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}
