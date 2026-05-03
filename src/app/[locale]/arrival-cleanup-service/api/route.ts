import { NextResponse } from 'next/server';
import { sendArrivalCleanupEmail } from '@/lib/emailjs';

type ArrivalCleanupRequest = {
  email: string;
  unixTime: number;
  carNumber: string;
};

export async function POST(request: Request) {
  let body: Partial<ArrivalCleanupRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'Invalid JSON body.',
      },
      { status: 400 },
    );
  }

  const { email, unixTime, carNumber } = body;

  if (typeof email !== 'string' || email.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'email must be a non-empty string.',
      },
      { status: 400 },
    );
  }

  if (typeof unixTime !== 'number' || !Number.isFinite(unixTime)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'unixTime must be a valid number.',
      },
      { status: 400 },
    );
  }

  if (typeof carNumber !== 'string' || carNumber.trim().length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'carNumber must be a non-empty string.',
      },
      { status: 400 },
    );
  }

  const normalizedCarNumber = carNumber.trim();

  try {
    await sendArrivalCleanupEmail({
      email,
      unixTime,
      carNumber: normalizedCarNumber,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to send email.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    email,
    unixTime,
    carNumber: normalizedCarNumber,
  });
}
