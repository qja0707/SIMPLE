import { useTranslations } from 'next-intl';
import styles from './page.module.css';

export default function ArrivalCleanupService() {
  const t = useTranslations('ArrivalCleanupService');

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
