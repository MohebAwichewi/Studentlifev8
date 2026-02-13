import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Count Total Verified Students
    const totalUsers = await prisma.user.count({
      where: { isVerified: true }
    })

    // 2. Group by University (Top 4)
    const uniStats = await prisma.user.groupBy({
      by: ['university'],
      _count: { university: true },
      orderBy: { _count: { university: 'desc' } },
      take: 4 
    })

    // Format for Frontend
    const universities = uniStats.map(stat => ({
      name: stat.university,
      percent: totalUsers > 0 ? Math.round((stat._count.university / totalUsers) * 100) : 0
    }))

    return NextResponse.json({ 
      totalNearby: totalUsers, 
      universities 
    })
  } catch (error) {
    console.error("Audience API Error:", error)
    return NextResponse.json({ totalNearby: 0, universities: [] })
  }
}
