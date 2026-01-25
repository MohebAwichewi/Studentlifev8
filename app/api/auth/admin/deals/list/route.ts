import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: { 
        business: {
          select: { businessName: true, plan: true, email: true }
        } 
      },
      // ⚠️ ensure 'priorityScore' exists in your schema, otherwise remove this line
      orderBy: [
        { priorityScore: 'desc' }, 
        { createdAt: 'desc' }      
      ]
    })

    // ✅ FIX: Flatten the data for the frontend
    const formattedDeals = deals.map(deal => ({
      ...deal,
      businessName: deal.business?.businessName || "Unknown",
      plan: deal.business?.plan || "N/A",
      email: deal.business?.email
    }))

    return NextResponse.json(formattedDeals)
  } catch (error) {
    console.error("Deals Fetch Error:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}