import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    const result = await db
      .collection('timeLogs')
      .aggregate([
        { $match: { username: session.username } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ])
      .toArray();

    const totalHours = result.length > 0 ? result[0].total : 0;

    // Get this week's hours
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekResult = await db
      .collection('timeLogs')
      .aggregate([
        {
          $match: {
            username: session.username,
            date: { $gte: startOfWeek },
          },
        },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ])
      .toArray();

    const weekHours = weekResult.length > 0 ? weekResult[0].total : 0;

    return NextResponse.json({
      total: totalHours,
      week: weekHours,
    });
  } catch (error) {
    console.error('Get total hours error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

