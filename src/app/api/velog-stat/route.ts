import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const VALID_USERNAME = /^[A-Za-z0-9._-]{1,40}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim() ?? '';

  if (!username || !VALID_USERNAME.test(username)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Enter a valid Velog username.',
      },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map(({ name }) => name);
  const hasAccessToken = cookieNames.includes('access_token');

  try {
    const velogResponse = await fetch(`https://velog.io/@${username}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'user-agent': 'SIMPLE Velog Stat Probe',
      },
    });

    return NextResponse.json({
      ok: true,
      username,
      cookieNames,
      hasAccessToken,
      velogStatus: velogResponse.status,
      message: hasAccessToken
        ? 'An access_token cookie exists for this origin.'
        : 'No Velog access_token cookie was sent to this origin.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        username,
        cookieNames,
        hasAccessToken,
        message:
          error instanceof Error ? error.message : 'Failed to reach Velog.',
      },
      { status: 502 },
    );
  }
}
