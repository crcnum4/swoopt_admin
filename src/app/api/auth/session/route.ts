import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST: Set session cookie
export async function POST(request: Request) {
  const { token, expiresAt } = await request.json();
  const cookieStore = await cookies();

  cookieStore.set('swoopt-session', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });

  return NextResponse.json({ success: true });
}

// DELETE: Clear session cookie
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('swoopt-session');
  return NextResponse.json({ success: true });
}
