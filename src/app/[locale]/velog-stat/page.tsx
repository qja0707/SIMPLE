'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

type ProbeResult = {
  ok: boolean;
  username?: string;
  cookieNames?: string[];
  hasAccessToken?: boolean;
  velogStatus?: number;
  message?: string;
};

export default function VelogStatPage() {
  const t = useTranslations('VelogStat');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setResult(null);
      setError(t('empty'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/velog-stat?username=${encodeURIComponent(trimmedUsername)}`,
      );
      const payload = (await response.json()) as ProbeResult;

      if (!response.ok) {
        setResult(payload);
        setError(payload.message ?? t('requestFailed'));
        return;
      }

      setResult(payload);
    } catch {
      setResult(null);
      setError(t('requestFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor='velog-id'>
            {t('inputLabel')}
          </label>
          <div className={styles.controls}>
            <input
              id='velog-id'
              type='text'
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t('inputPlaceholder')}
              className={styles.input}
              autoComplete='off'
              spellCheck={false}
            />
            <button type='submit' className={styles.button} disabled={isLoading}>
              {isLoading ? t('loading') : t('submit')}
            </button>
          </div>
        </form>

        <p className={styles.helper}>{t('helper')}</p>

        {error ? <div className={styles.error}>{error}</div> : null}

        {result ? (
          <section className={styles.result}>
            <h2 className={styles.resultTitle}>{t('resultTitle')}</h2>
            <dl className={styles.resultGrid}>
              <div className={styles.row}>
                <dt>{t('requestedUser')}</dt>
                <dd>{result.username ?? '-'}</dd>
              </div>
              <div className={styles.row}>
                <dt>{t('probeStatus')}</dt>
                <dd>{result.ok ? 'ok' : 'error'}</dd>
              </div>
              <div className={styles.row}>
                <dt>{t('velogStatus')}</dt>
                <dd>{result.velogStatus ?? '-'}</dd>
              </div>
              <div className={styles.row}>
                <dt>{t('accessTokenSeen')}</dt>
                <dd>
                  {result.hasAccessToken
                    ? t('accessTokenSeenYes')
                    : t('accessTokenSeenNo')}
                </dd>
              </div>
              <div className={styles.row}>
                <dt>{t('cookieNames')}</dt>
                <dd>
                  {result.cookieNames && result.cookieNames.length > 0
                    ? result.cookieNames.join(', ')
                    : t('noCookies')}
                </dd>
              </div>
              <div className={styles.row}>
                <dt>{t('message')}</dt>
                <dd>{result.message ?? '-'}</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>
    </div>
  );
}
