import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gameId = params.id;

  if (!gameId) {
    return NextResponse.json({ error: 'No game ID provided' }, { status: 400 });
  }

  try {
    const data = await redisClient.get(`game:${gameId}`);

    if (!data) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const game = JSON.parse(data);

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
