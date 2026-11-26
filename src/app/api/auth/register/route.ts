import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/db';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = getUserByEmail(cleanEmail);

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      password: password, // For prototype testing locally
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);

    // Return sanitized user object
    const { password: _, ...sanitizedUser } = newUser;
    return NextResponse.json(
      { success: true, message: 'Account created successfully', user: sanitizedUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
