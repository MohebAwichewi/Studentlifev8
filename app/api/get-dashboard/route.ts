import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Fetch real counts from the database
    const totalRevenue = 0 // You can calculate this later based on deals
    
    // Count 'APPROVED' businesses
    const livePartners = await prisma.business.count({
      where: { status: 'APPROVED' }
    })

    // Count 'PENDING' businesses
    const pendingRequests = await prisma.business.count({
      where: { status: 'PENDING' }
    })

    // Count Students (if you have a student table, otherwise 0)
    // const activeStudents = await prisma.student.count() 
    const activeStudents = 0

    // 2. Fetch recent applications (Pending ones)
    const recentApplications = await prisma.business.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // 3. Return the data
    return NextResponse.json({
      stats: {
        revenue: `${totalRevenue} TND`,
        livePartners,
        pendingRequests,
        activeStudents
      },
      recentApplications
    })

  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}