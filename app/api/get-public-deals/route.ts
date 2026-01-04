import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch deals and include the Business details (name, category)
    // Make sure your schema has a relation like 'business: Business'
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            businessName: true,
            // category: true, // Uncomment if you have categories in your DB
          }
        }
      }
    })

    return NextResponse.json({ deals })
  } catch (error) {
    console.error("Failed to fetch deals", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}