import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adapte le chemin selon ton projet

export async function GET() {
  try {
    const totalQuestions = await prisma.question.count();

    return NextResponse.json({ totalQuestions });
  } catch (error) {
    console.error('❌ Failed to fetch question count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
