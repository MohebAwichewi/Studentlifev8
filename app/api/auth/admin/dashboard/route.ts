import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 1. Fetch Pending Businesses
    const pendingBusinesses = await prisma.business.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Fetch Pending Deals (Include business name to show who posted it)
    const pendingDeals = await prisma.deal.findMany({
      where: { status: 'PENDING' },
      include: { 
        business: {
          select: { businessName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        partners: pendingBusinesses,
        deals: pendingDeals
      }
    })

  } catch (error) {
    console.error("Admin Dashboard Error:", error)
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 })
  }
}