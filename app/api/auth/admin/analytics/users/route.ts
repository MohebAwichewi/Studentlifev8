import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Basic Counts
    const totalStudents = await prisma.student.count()
    const verifiedStudents = await prisma.student.count({ where: { isVerified: true } })
    
    // 2. Students joined today (Real Growth Metric)
    const startOfDay = new Date()
    startOfDay.setHours(0,0,0,0)
    const newToday = await prisma.student.count({
      where: { createdAt: { gte: startOfDay } }
    })

    // 3. Distribution by University (Top 5)
    // This aggregates real data from the 'university' column
    const uniStats = await prisma.student.groupBy({
      by: ['university'],
      _count: {
        university: true,
      },
      orderBy: {
        _count: {
          university: 'desc',
        },
      },
      take: 5,
    })

    // 4. Recent Student Signups
    const recentStudents = await prisma.student.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
        isVerified: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      total: totalStudents,
      verified: verifiedStudents,
      newToday,
      uniDistribution: uniStats,
      recent: recentStudents
    })

  } catch (error) {
    console.error("Analytics Error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}