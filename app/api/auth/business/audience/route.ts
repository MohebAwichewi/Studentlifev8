import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Count Total Verified Students in Database
    const totalStudents = await prisma.student.count({
      where: { isVerified: true }
    })

    // 2. Group by University (Real Data Analysis)
    const uniStats = await prisma.student.groupBy({
      by: ['university'],
      _count: { university: true },
      orderBy: { _count: { university: 'desc' } },
      take: 4 // Top 4 Unis
    })

    // Format for Frontend
    const universities = uniStats.map(stat => ({
      name: stat.university,
      percent: totalStudents > 0 ? Math.round((stat._count.university / totalStudents) * 100) : 0
    }))

    return NextResponse.json({ 
      totalNearby: totalStudents, 
      universities 
    })
  } catch (error) {
    return NextResponse.json({ totalNearby: 0, universities: [] })
  }
}