import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"

// Best practice: In a real app, import 'prisma' from a singleton lib file to avoid connection limits
// For now, this works for your current setup:
const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession()
  
  // Basic security check
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Run all database queries in parallel for speed
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
        // ✅ MATCHING YOUR NEW SCHEMA: using 'businessName'
        select: { 
          id: true, 
          businessName: true, // This must match the field in schema.prisma
          email: true, 
          createdAt: true, 
          status: true 
        }
      })
    ])

    // 2. Calculate Revenue (Example: 50 TND per approved partner)
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