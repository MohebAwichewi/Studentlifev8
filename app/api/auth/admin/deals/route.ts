import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch ALL deals (Newest first)
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: { businessName: true }
        }
      }
    })
    return NextResponse.json(deals)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}