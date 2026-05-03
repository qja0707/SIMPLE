import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import styles from './page.module.css';

export default async function ArrivalCleanupService({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('ArrivalCleanupService');
  const requestHeaders = await headers();
  const host =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';
  const postPath = `/${locale}/arrival-cleanup-service/api`;
  const postUrl = host ? `${protocol}://${host}${postPath}` : postPath;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(postUrl)}`;

  return (
    <div className={styles.container}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>{t('status')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
        <div className={styles.qrFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.qrImage}
            src={qrCodeUrl}
            alt='Arrival cleanup service POST API QR code'
          />
        </div>
        <code className={styles.postUrl}>{postUrl}</code>
      </section>
    </div>
  );
}
