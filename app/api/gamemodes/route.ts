import { prisma } from '@/lib/prisma'; // adapte si nécessaire
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gameModes = await prisma.gameMode.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        emoji: true,
        emojiUrl: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(gameModes);
  } catch (error) {
    console.error('Erreur API game-modes:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}
