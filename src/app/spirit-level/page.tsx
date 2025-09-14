'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const CENTER_POSITION = 50; // levelBar 중앙 위치 (%)
const MAX_OFFSET = 50; // levelBar 중앙에서 최대 이동 거리 (%)

export default function SpiritLevel() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      setTilt({ x: gamma, y: beta });
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);

      return () => {
        window.removeEventListener(
          'deviceorientation',
          handleDeviceOrientation
        );
      };
    }
  }, []);

  // -90도~90도를 -1~1로 정규화하고 물리적 움직임 시뮬레이션
  const normalizedTilt = Math.max(-1, Math.min(1, tilt.x / 90));
  const bubbleOffset = -Math.tanh(normalizedTilt * 6) * MAX_OFFSET;

  const bubbleStyle = {
    left: `${CENTER_POSITION + bubbleOffset}%`,
    transform: `translate(-50%, -50%)`,
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Spirit Level</h1>

        <div className={styles.content}>
          {/* 수평계 시각화 */}
          <div className={styles.levelVisualization}>
            <div className={styles.levelBar}>
              {/* 수직선 표시 (왼쪽) */}
              <div
                className={`${styles.verticalLine} ${styles.verticalLineLeft}`}
              ></div>

              {/* 수직선 표시 (오른쪽) */}
              <div
                className={`${styles.verticalLine} ${styles.verticalLineRight}`}
              ></div>

              {/* 기포 시뮬레이션 */}
              <div className={styles.bubble} style={bubbleStyle}>
                <div className={styles.bubbleCenter}></div>
              </div>
            </div>
          </div>

          {/* 상태 표시 */}
          <div className={styles.statusContainer}>
            <div className={styles.statusText}>Spirit Level</div>
            <p className={styles.description}>기기를 수평으로 유지하세요</p>
            <div className={styles.tiltInfo}>X: {tilt.x.toFixed(1)}°</div>
          </div>

          {/* 사용법 안내 */}
          <div className={styles.instructions}>
            <h3 className={styles.instructionsTitle}>사용법</h3>
            <ul className={styles.instructionsList}>
              <li>• 기기를 측정할 표면에 올려놓으세요</li>
              <li>• 파란색 기포가 중앙에 오도록 조정하세요</li>
              <li>• 기포가 중앙에 있으면 수평입니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
