import { getTranslations } from 'next-intl/server';
import styles from './page.module.css';

export default async function QrScan() {
  const t = await getTranslations('QrScan');

  return (
    <div className={styles.container}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>{t('status')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
      </section>
    </div>
  );
}
