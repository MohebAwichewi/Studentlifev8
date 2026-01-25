import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch universities sorted by newest
    // Note: Verify if your model is named 'University' or 'Business' in schema.prisma
    const universities = await prisma.university.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(universities)
  } catch (error) {
    console.error("Fetch Error:", error)
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 })
  }
}