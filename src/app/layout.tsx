import type { Metadata } from 'next';
import './globals.css';
import { defaultLocale, hasLocale } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'Spirit Level',
  description: 'Use your device as a spirit level.',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;
  const htmlLang = hasLocale(locale) ? locale : defaultLocale;

  return (
    <html lang={htmlLang}>
      <body>{children}</body>
    </html>
  );
}
