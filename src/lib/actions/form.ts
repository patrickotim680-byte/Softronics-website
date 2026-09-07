/** Helpers for reading FormData safely inside Server Actions. */

export function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export function optional(formData: FormData, key: string): string | null {
  const value = text(formData, key).trim();
  return value.length > 0 ? value : null;
}

export function checkbox(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === 'on' || value === 'true' || value === '1';
}

export function integer(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function nullableInteger(formData: FormData, key: string): number | null {
  const raw = text(formData, key).trim();
  if (raw.length === 0) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function uuidOrNull(formData: FormData, key: string): string | null {
  const value = text(formData, key).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}
