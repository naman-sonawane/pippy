import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    const query: any = { username: session.username };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await db
      .collection('timeLogs')
      .find(query)
      .sort({ date: 1 })
      .toArray();

    const formattedLogs = logs.map((log) => {
      const d = new Date(log.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;

      return {
        id: log._id.toString(),
        date: localDateStr,
        hours: log.hours,
        activity: log.activity || null,
      };
    });

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Get time logs error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

