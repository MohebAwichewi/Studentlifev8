import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: { 
        business: {
          select: { businessName: true, plan: true }
        } 
      },
      orderBy: [
        { priorityScore: 'desc' }, // Priority first
        { createdAt: 'desc' }      // Then newest
      ]
    })
    return NextResponse.json(deals)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}