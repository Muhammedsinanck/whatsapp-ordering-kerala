import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/db';
import { User } from '@/types';

// Initiates Google OAuth 2.0 flow
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || `${proto}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?oauth_missing=true`);
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}

// Programmatic verification & mock/demo sign-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existing = await getUserByEmail(cleanEmail);

    if (!existing) {
      const newUser: User = {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`,
        createdAt: new Date().toISOString()
      };
      await saveUser(newUser);
      existing = newUser;
    }

    const { password: _, ...sanitizedUser } = existing;
    const response = NextResponse.json({ success: true, user: sanitizedUser });

    response.cookies.set('kadalink_user_session', JSON.stringify(sanitizedUser), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
