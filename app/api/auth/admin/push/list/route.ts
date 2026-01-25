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
      orderBy: { createdAt: 'desc' }
    })
    
    // 1. Flatten Data (Matches Frontend Table perfectly)
    const formatted = requests.map(req => ({
        ...req,
        // Pull businessName to top level so Frontend finds it instantly
        businessName: req.business?.businessName || "System", 
        category: req.business?.category || "General"
    }))

    // 2. Sort manually to ensure PENDING is always first
    const sorted = formatted.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
      return 0
    })

    return NextResponse.json(sorted)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}