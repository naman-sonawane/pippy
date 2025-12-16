import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    const { id, hours, activity, date } = await request.json();

    if (!id || !hours || !date) {
      return NextResponse.json(
        { error: 'id, hours, and date are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const timeLogDate = new Date(date);
    timeLogDate.setHours(0, 0, 0, 0);

    const updateData: any = {
      hours: parseFloat(hours),
      date: timeLogDate,
      updatedAt: new Date(),
    };

    if (activity) {
      updateData.activity = activity;
    } else {
      updateData.activity = null;
    }

    const result = await db.collection('timeLogs').updateOne(
      {
        _id: new ObjectId(id),
        username: session.username,
      },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'log entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update time log error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

