import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Please enter your email' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Please enter your password' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please check or sign up.' },
        { status: 404 }
      );
    }

    // Prototype check: if password matches or user has no password set (demo profile)
    if (user.password && user.password !== password) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    const { password: _, ...sanitizedUser } = user;
    return NextResponse.json({ success: true, user: sanitizedUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed. Please try again.' }, { status: 500 });
  }
}
