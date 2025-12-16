import { cookies } from 'next/headers';
import { getDb } from './mongodb';
import bcrypt from 'bcryptjs';

export interface User {
  _id?: string;
  username: string;
  password: string;
  createdAt?: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(username: string, password: string): Promise<User> {
  const db = await getDb();
  const hashedPassword = await hashPassword(password);
  
  const user = {
    username: username.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
  };

  const result = await db.collection('users').insertOne(user);
  return { ...user, _id: result.insertedId.toString() };
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ username: username.toLowerCase() });
  
  if (!user) return null;
  
  return {
    _id: user._id.toString(),
    username: user.username,
    password: user.password,
    createdAt: user.createdAt,
  };
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value;
  
  if (!username) return null;
  
  return { username };
}

export async function setSession(username: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('username', username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('username');
}

