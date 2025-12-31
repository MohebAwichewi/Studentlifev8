import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            // ✅ FIXED: Changed 'name' to 'businessName'
            businessName: true, 
            category: true,
            // You can add other fields if needed, like 'id' or 'image'
          }
        }
      }
    })

    // Optional: Transform the data if your frontend specifically expects "name"
    const formattedDeals = deals.map(deal => ({
      ...deal,
      businessName: deal.business.businessName, // flatten for easier frontend use if needed
      businessCategory: deal.business.category
    }))

    return NextResponse.json({ 
      success: true, 
      deals: formattedDeals 
    })

  } catch (error) {
    console.error('Deals List Error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}