import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    const { hours, date, activity } = await request.json();

    if (!hours || !date) {
      return NextResponse.json(
        { error: 'hours and date are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Parse YYYY-MM-DD as a LOCAL date to avoid UTC offset shifting the day
    const [yearStr, monthStr, dayStr] = (date as string).split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const timeLogDate = new Date(year, month - 1, day);
    timeLogDate.setHours(0, 0, 0, 0);

    const logEntry: any = {
      username: session.username,
      date: timeLogDate,
      hours: parseFloat(hours),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (activity) {
      logEntry.activity = activity;
    }

    const result = await db.collection('timeLogs').insertOne(logEntry);

    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Log time error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

