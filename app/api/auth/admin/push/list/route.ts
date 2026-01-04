import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const requests = await prisma.pushRequest.findMany({
      include: { 
        business: {
          select: { businessName: true, category: true }
        } 
      },
      orderBy: [
        { status: 'asc' }, // PENDING first (alphabetically P comes before S/R usually, but we want PENDING at top)
        { createdAt: 'desc' }
      ]
    })
    
    // Sort manually to ensure PENDING is always first
    const sorted = requests.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
      return 0
    })

    return NextResponse.json(sorted)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}