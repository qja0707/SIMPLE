'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

type Html5QrcodeInstance = {
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    configuration: {
      fps: number;
      qrbox: { width: number; height: number };
      aspectRatio: number;
    },
    qrCodeSuccessCallback: (decodedText: string) => void,
    qrCodeErrorCallback?: () => void,
  ) => Promise<null>;
  stop: () => Promise<void>;
  clear: () => void;
  isScanning: boolean;
};

type Html5QrcodeConstructor = new (
  elementId: string,
  verbose: boolean,
) => Html5QrcodeInstance;

const SCAN_CONFIG = {
  fps: 8,
  qrbox: { width: 240, height: 240 },
  aspectRatio: 1,
};

export default function QrScan() {
  const t = useTranslations('QrScan');
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const scannedRef = useRef(false);
  const [carNumber, setCarNumber] = useState('');
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'
  >('idle');
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      // The scanner can already be mid-transition on mobile browsers.
    }

    try {
      scanner.clear();
    } catch {
      // Clearing is best-effort when initialization failed halfway.
    }

    scannerRef.current = null;
    document.getElementById('qr-reader')?.replaceChildren();
  }

  function waitForScannerReset() {
    return new Promise((resolve) => {
      window.setTimeout(resolve, 250);
    });
  }

  async function createScanner(Html5Qrcode: Html5QrcodeConstructor) {
    await stopScanner();

    const scanner = new Html5Qrcode('qr-reader', false);
    scannerRef.current = scanner;

    return scanner;
  }

  function getCameraErrorMessage(error: unknown) {
    const details = getCameraErrorDetails(error);

    if (!window.isSecureContext) {
      return t('cameraSecureContextError');
    }

    if (details.name === 'NotAllowedError') {
      return t('cameraPermissionError');
    }

    if (details.name === 'NotFoundError') {
      return t('cameraNotFoundError');
    }

    if (details.name === 'NotReadableError') {
      return t('cameraInUseError');
    }

    if (!details.message) return t('cameraError');

    return `${t('cameraError')} (${details.message})`;
  }

  function getCameraErrorDetails(error: unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: `${error.name}: ${error.message}`,
      };
    }

    if (typeof error === 'string') {
      return {
        name: '',
        message: error,
      };
    }

    if (error && typeof error === 'object') {
      return {
        name: 'name' in error ? String(error.name) : '',
        message: JSON.stringify(error),
      };
    }

    return {
      name: '',
      message: '',
    };
  }

  function getPostUrl(decodedText: string) {
    const url = new URL(decodedText, window.location.origin);

    if (!url.pathname.endsWith('/arrival-cleanup-service/api')) {
      throw new Error(t('scanInvalidUrl'));
    }

    return url;
  }

  async function submitScan(decodedText: string) {
    if (scannedRef.current) return;

    scannedRef.current = true;
    setCameraStatus('submitting');
    console.info('QR detected:', decodedText);

    try {
      const postUrl = getPostUrl(decodedText);
      const email = postUrl.searchParams.get('email') ?? '';
      const normalizedCarNumber = carNumber.trim();

      if (!normalizedCarNumber) {
        throw new Error(t('scanMissingCarNumber'));
      }

      if (!email) {
        throw new Error(t('scanMissingEmail'));
      }

      await stopScanner();
      console.info('Sending arrival cleanup POST:', postUrl.toString());

      const response = await fetch(postUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          carNumber: normalizedCarNumber,
          unixTime: Math.floor(Date.now() / 1000),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
          `${t('scanPostFailed')} (${response.status}: ${errorBody})`,
        );
      }

      setScanMessage(t('scanSuccess'));
      setCameraStatus('success');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('scanError');

      console.error('QR scan submit failed:', error);
      scannedRef.current = false;
      setScanMessage(errorMessage);
      setCameraStatus('error');
    }
  }

  async function startScanner() {
    if (!window.isSecureContext) {
      setCameraStatus('error');
      setScanMessage(t('cameraSecureContextError'));
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error');
      setScanMessage(t('cameraUnsupportedError'));
      return;
    }

    setCameraStatus('loading');
    setScanMessage('');
    scannedRef.current = false;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const Scanner = Html5Qrcode as Html5QrcodeConstructor;
      const scanner = await createScanner(Scanner);

      try {
        await scanner.start(
          {
            facingMode: 'environment',
          },
          SCAN_CONFIG,
          submitScan,
        );
      } catch (firstError) {
        await stopScanner();
        await waitForScannerReset();

        const fallbackScanner = await createScanner(Scanner);

        try {
          await fallbackScanner.start({}, SCAN_CONFIG, submitScan);
        } catch {
          throw firstError;
        }
      }

      setCameraStatus('ready');
    } catch (error) {
      setCameraStatus('error');
      setScanMessage(getCameraErrorMessage(error));
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
            <div id='qr-reader' className={styles.qrReader} />
            {cameraStatus !== 'ready' && cameraStatus !== 'submitting' ? (
              <div className={styles.cameraOverlay}>
                <button
                  type='button'
                  className={styles.cameraButton}
                  onClick={startScanner}
                  disabled={cameraStatus === 'loading'}
                >
                  {cameraStatus === 'loading'
                    ? t('cameraLoading')
                    : t('cameraButton')}
                </button>
                {cameraStatus === 'error' ? (
                  <p className={styles.cameraMessage}>
                    {scanMessage || t('cameraError')}
                  </p>
                ) : (
                  <p className={styles.cameraMessage}>{t('cameraHint')}</p>
                )}
              </div>
            ) : null}
            {cameraStatus === 'submitting' ? (
              <div className={styles.cameraOverlay}>
                <p className={styles.cameraMessage}>{t('scanSubmitting')}</p>
              </div>
            ) : null}
          </div>
          {scanMessage ? (
            <p
              className={`${styles.resultMessage} ${
                cameraStatus === 'success' ? styles.resultSuccess : ''
              }`}
            >
              {scanMessage}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
