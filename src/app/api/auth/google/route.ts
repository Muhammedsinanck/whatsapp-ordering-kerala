import { NextRequest, NextResponse } from 'next/server';
import { GoogleUser } from '@/types';

const DEFAULT_GOOGLE_PROFILES: GoogleUser[] = [
  {
    id: 'google-sinan-1',
    email: 'sinan@gmail.com',
    name: 'Sinan C.K.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'google-anjali-2',
    email: 'anjali@gmail.com',
    name: 'Anjali Nair',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'google-fathima-3',
    email: 'fathima.boutique@gmail.com',
    name: 'Fathima Raheem',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user: GoogleUser = {
      id: `google-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`
    };

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
