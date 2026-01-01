import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      approvedPartners,
      pendingPartners,
      studentsCount,
      recentApplications
    ] = await prisma.$transaction([
      prisma.business.count({ where: { status: 'APPROVED' } }),
      prisma.business.count({ where: { status: 'PENDING' } }),
      prisma.student.count(),
      prisma.business.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { 
          id: true, 
          businessName: true, // ✅ CORRECT: Matches your schema
          email: true, 
          createdAt: true, 
          status: true 
        }
      })
    ])

    const revenue = approvedPartners * 50 

    return NextResponse.json({
      stats: {
        revenue: `${revenue.toLocaleString()} TND`,
        livePartners: approvedPartners,
        pendingRequests: pendingPartners,
        activeStudents: studentsCount
      },
      recentApplications
    })
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ error: 'Database Error' }, { status: 500 })
  }
}