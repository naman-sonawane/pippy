import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByUsername, setSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password, passwordConfirm } = await request.json();

    if (!username || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: 'all fields are required' },
        { status: 400 }
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: 'passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByUsername(username);

    if (existingUser) {
      return NextResponse.json(
        { error: 'username already exists' },
        { status: 400 }
      );
    }

    const user = await createUser(username, password);
    await setSession(user.username);

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

