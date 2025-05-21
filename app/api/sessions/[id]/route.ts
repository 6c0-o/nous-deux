import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis';
import { Session } from '@/types/session.interface';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'No session ID provided' },
      { status: 400 }
    );
  }

  try {
    const data = await redisClient.get(`session:${sessionId}`);

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session: Session = JSON.parse(data);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
