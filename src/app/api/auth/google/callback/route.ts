import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, saveUser, getStoresByOwner } from '@/lib/db';
import { User } from '@/types';

// Handles redirect callback from Google OAuth 2.0
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || `${proto}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (error || !code) {
    console.warn('Google OAuth error or missing code:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || 'Authorization was cancelled')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?oauth_missing=true`);
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange failed:', errText);
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile from Google Userinfo API
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userinfoRes.ok) {
      console.error('Failed to fetch userinfo from Google');
      return NextResponse.redirect(`${baseUrl}/login?error=userinfo_failed`);
    }

    const profile = await userinfoRes.json();
    const cleanEmail = profile.email?.toLowerCase().trim();

    if (!cleanEmail) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email_provided`);
    }

    // 3. Find or register user in database
    const isOwnerAdmin = cleanEmail === 'ckmuhammedsinan@gmail.com' || cleanEmail === 'sinan@gmail.com';
    let user = await getUserByEmail(cleanEmail);
    if (!user) {
      user = {
        id: `usr-google-${profile.sub || Date.now()}`,
        name: profile.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || cleanEmail)}`,
        role: isOwnerAdmin ? 'admin' : 'seller',
        createdAt: new Date().toISOString()
      };
      await saveUser(user);
    } else if (isOwnerAdmin && user.role !== 'admin') {
      user.role = 'admin';
      await saveUser(user);
    }

    // 4. Decide destination: admin goes to /admin, existing store owners go to /dashboard, new users go to /onboarding
    const userStores = await getStoresByOwner(cleanEmail);
    const destination = isOwnerAdmin ? '/admin' : userStores.length > 0 ? '/dashboard' : '/onboarding';

    // 5. Redirect and set kadalink_user_session cookie
    const { password: _, ...safeUser } = user;
    const response = NextResponse.redirect(`${baseUrl}${destination}?auth=google_success`);

    response.cookies.set('kadalink_user_session', JSON.stringify(safeUser), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: proto === 'https'
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_internal_error`);
  }
}
