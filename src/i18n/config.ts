export const locales = ['en', 'ko'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

export function hasLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}
