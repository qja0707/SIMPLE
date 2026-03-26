'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { locales } from '@/i18n/config';
import { tools } from '@/config/tools';
import styles from './app-shell.module.css';

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname, locale]);

  function isToolActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navigation = (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('tools')}</div>
        <nav className={styles.toolList} aria-label={t('tools')}>
          {tools.map((tool) => {
            const active = isToolActive(tool.href);

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`${styles.toolLink} ${active ? styles.toolLinkActive : ''}`}
              >
                <span className={styles.toolText}>{t(`items.${tool.translationKey}`)}</span>
                <span className={styles.toolMeta}>
                  {active ? t('currentTool') : t('openTool')}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('language')}</div>
        <div className={styles.localeList}>
          {locales.map((nextLocale) => {
            const active = nextLocale === locale;

            return (
              <Link
                key={nextLocale}
                href={pathname}
                locale={nextLocale}
                className={`${styles.localeButton} ${active ? styles.localeButtonActive : ''}`}
              >
                {t(`locales.${nextLocale}`)}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarPanel}>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>{t('appName')}</div>
            <p className={styles.brandDescription}>{t('description')}</p>
          </div>
          {navigation}
        </div>
      </aside>

      <div className={styles.content}>
        <button
          type='button'
          className={styles.mobileMenuButton}
          onClick={() => setIsMenuOpen(true)}
          aria-label={t('openMenu')}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.mobileMenuButtonLabel}>≡</span>
        </button>

        <main className={styles.main}>{children}</main>

        {isMenuOpen ? (
          <div className={styles.overlay} role='dialog' aria-modal='true'>
            <div className={styles.overlayHeader}>
              <div className={styles.overlayTitle}>{t('menuTitle')}</div>
              <button
                type='button'
                className={styles.closeButton}
                onClick={() => setIsMenuOpen(false)}
                aria-label={t('closeMenu')}
              >
                ×
              </button>
            </div>
            <div className={styles.overlayBody}>{navigation}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
