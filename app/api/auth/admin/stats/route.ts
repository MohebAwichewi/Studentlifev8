import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Get Real Counts
    const activePartners = await prisma.business.count({ where: { status: 'ACTIVE' } })
    const activeStudents = await prisma.student.count({ where: { isVerified: true } })
    const pendingRequests = await prisma.business.count({ where: { status: 'PENDING' } })

    // 2. Get Recent Applications for the Table
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        businessName: true,
        email: true,
        plan: true,
        status: true,
        isTrialActive: true,
        trialEnds: true
      }
    })

    return NextResponse.json({
      stats: {
        revenue: 0, 
        totalBusinesses: activePartners,
        pendingRequests, 
        totalStudents: activeStudents
      },
      businesses 
    })

  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
} // <--- THIS BRACE WAS MISSING