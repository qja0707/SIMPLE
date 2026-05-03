const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const ARRIVAL_CLEANUP_TEMPLATE_ID = 'template_ibnkb6p';

type ArrivalCleanupEmailParams = {
  email: string;
  unixTime: number;
  carNumber: string;
};

type EmailJsConfig = {
  serviceId: string;
  publicKey: string;
  privateKey?: string;
};

function getEmailJsConfig(): EmailJsConfig {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey) {
    throw new Error('Missing EmailJS environment variables.');
  }

  return {
    serviceId,
    publicKey,
    privateKey,
  };
}

function formatArrivalTime(unixTime: number) {
  return new Date(unixTime * 1000).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export async function sendArrivalCleanupEmail({
  email,
  unixTime,
  carNumber,
}: ArrivalCleanupEmailParams) {
  const { serviceId, publicKey, privateKey } = getEmailJsConfig();
  const arrivalTime = formatArrivalTime(unixTime);

  const response = await fetch(EMAILJS_SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: ARRIVAL_CLEANUP_TEMPLATE_ID,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        email,
        car_id: carNumber,
        arrival_time: arrivalTime,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(`EmailJS request failed: ${message}`);
  }
}
