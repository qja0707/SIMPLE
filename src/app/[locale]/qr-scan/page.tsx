'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

export default function QrScan() {
  const t = useTranslations('QrScan');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [carNumber, setCarNumber] = useState('');
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error');
      return;
    }

    setCameraStatus('loading');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus('ready');
    } catch {
      setCameraStatus('error');
    }
  }

  return (
    <div className={styles.container}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>{t('status')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <div className={styles.form}>
          <input
            className={styles.carInput}
            type='text'
            value={carNumber}
            onChange={(event) => setCarNumber(event.target.value.slice(0, 10))}
            maxLength={10}
            placeholder={t('carPlaceholder')}
            aria-label={t('carInputLabel')}
            autoComplete='off'
            inputMode='text'
          />

          <div className={styles.cameraBox}>
            <video
              ref={videoRef}
              className={styles.cameraVideo}
              autoPlay
              muted
              playsInline
            />
            {cameraStatus !== 'ready' ? (
              <div className={styles.cameraOverlay}>
                <button
                  type='button'
                  className={styles.cameraButton}
                  onClick={startCamera}
                  disabled={cameraStatus === 'loading'}
                >
                  {cameraStatus === 'loading'
                    ? t('cameraLoading')
                    : t('cameraButton')}
                </button>
                {cameraStatus === 'error' ? (
                  <p className={styles.cameraMessage}>{t('cameraError')}</p>
                ) : (
                  <p className={styles.cameraMessage}>{t('cameraHint')}</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
