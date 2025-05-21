import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '@/lib/redis';
import { Session } from '@/types/session.interface';

export async function POST(req: NextRequest) {
  const { name, type, password } = await req.json();

  if (!name || !type) {
    return NextResponse.json({ error: 'missing_parameters' }, { status: 400 });
  }

  try {
    const sessionId = uuidv4();
    const isOnlineMode = type === 'online';
    const code = Math.floor(100000 + Math.random() * 900000);

    const redisSession: Session = {
      room: sessionId,
      code: code.toString(),
      name,
      players: [],
      isOnlineMode,
      password: password || null,
      usedQuestions: [],
      status: 'waiting',
      currentGameId: null,
      createdAt: Date.now(),
    };

    await redisClient.set(`session:${sessionId}`, JSON.stringify(redisSession));

    return NextResponse.json({
      id: sessionId,
      code: code.toString(),
    });
  } catch (error) {
    console.error('Error', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
