import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Find the business in the Real DB
    const business = await prisma.business.findUnique({
      where: { email },
      include: {
        deals: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // CALCULATE REAL STATS
    // For MVP, 'reach' is the number of active deals * 10 (simulated reach multiplier)
    // Later you can add a 'views' column to the Deal model.
    const activeDealsCount = business.deals.length
    
    const stats = {
      reach: activeDealsCount * 125, // Example logic: each deal gets ~125 views
      redemptions: Math.floor(activeDealsCount * 8.5), // Example logic
      convRate: "6.8%", // Static for MVP until you track clicks
      daysLeft: business.trialEnds 
        ? Math.ceil((new Date(business.trialEnds).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0
    }

    return NextResponse.json({ business, stats, activeDeals: business.deals })

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}