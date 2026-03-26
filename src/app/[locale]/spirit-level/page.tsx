'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

const CENTER_POSITION = 50;
const MAX_OFFSET = 50;
const LEVEL_TOLERANCE = 0.2;

export default function SpiritLevel() {
  const t = useTranslations('SpiritLevel');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      setTilt({ x: gamma, y: beta });
    };

    if (!window.DeviceOrientationEvent) return;

    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  const normalizedTiltX = Math.max(-1, Math.min(1, tilt.x / 90));
  const normalizedTiltY = Math.max(-1, Math.min(1, tilt.y / 90));
  const bubbleOffsetX = -Math.tanh(normalizedTiltX * 6) * MAX_OFFSET;
  const bubbleOffsetY = -Math.tanh(normalizedTiltY * 6) * MAX_OFFSET;
  const isCentered =
    Math.abs(tilt.x) <= LEVEL_TOLERANCE && Math.abs(tilt.y) <= LEVEL_TOLERANCE;

  const bubbleStyle = {
    left: `${CENTER_POSITION + bubbleOffsetX}%`,
    top: `${CENTER_POSITION + bubbleOffsetY}%`,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('title')}</h1>

        <div className={styles.content}>
          <div className={styles.levelVisualization}>
            <div className={styles.levelCross}>
              <div className={styles.horizontalBar} />
              <div className={styles.verticalBar} />
              <div
                className={`${styles.targetRing} ${isCentered ? styles.targetRingActive : ''}`}
              />

              <div className={styles.bubble} style={bubbleStyle}>
                <div className={styles.bubbleCenter} />
              </div>
            </div>
          </div>

          <div className={styles.statusContainer}>
            <div className={styles.statusText}>{t('status')}</div>
            <p className={styles.description}>{t('description')}</p>
            <div className={styles.tiltValues}>
              <div className={styles.tiltInfo}>
                {t('tiltX', { value: tilt.x.toFixed(1) })}
              </div>
              <div className={styles.tiltInfo}>
                {t('tiltY', { value: tilt.y.toFixed(1) })}
              </div>
            </div>
          </div>

          <div className={styles.instructions}>
            <h2 className={styles.instructionsTitle}>
              {t('instructionsTitle')}
            </h2>
            <ul className={styles.instructionsList}>
              <li>{t('instructions.0')}</li>
              <li>{t('instructions.1')}</li>
              <li>{t('instructions.2')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
