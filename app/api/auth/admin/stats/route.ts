import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ FIX 1: Use shared client

export async function GET() {
  try {
    // 1. Fetch real counts from the database
    const totalRevenue = 0 // Placeholder for now

    // ✅ FIX 2: Check for 'ACTIVE', not 'APPROVED'
    const livePartners = await prisma.business.count({
      where: { status: 'ACTIVE' }
    })

    // Count 'PENDING' businesses
    const pendingRequests = await prisma.business.count({
      where: { status: 'PENDING' }
    })

    // ✅ FIX 3: Enable Student Count (Since you have the table now)
    const activeStudents = await prisma.student.count()

    // Pending Verifications Count (Students who uploaded ID but not yet verified)
    const pendingVerifications = await prisma.student.count({
      where: {
        isVerified: false,
        idCardUrl: { not: null }
      }
    })

    // Redemptions Today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const redemptionsToday = await prisma.redemption.count({
      where: {
        createdAt: { gte: today }
      }
    })

    // 2. Fetch recent applications (Pending ones)
    const recentApplications = await prisma.business.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // 3. Return the data
    return NextResponse.json({
      success: true, // Added success flag for easier frontend checks
      stats: {
        revenue: `£${totalRevenue}`,
        livePartners,
        pendingRequests,
        activeStudents,
        pendingVerifications,
        redemptionsToday
      },
      recentApplications
    })

  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}