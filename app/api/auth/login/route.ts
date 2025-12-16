import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword, setSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'username and password are required' },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'invalid username or password' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'invalid username or password' },
        { status: 401 }
      );
    }

    await setSession(user.username);

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

