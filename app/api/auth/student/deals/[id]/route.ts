import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Parse the ID from the URL (e.g., /api/auth/student/deals/15)
    const dealId = parseInt(params.id)

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid Deal ID" }, { status: 400 })
    }

    // 1. Fetch the Deal with Business Profile & Locations
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            logo: true,
            category: true,
            locations: true // ✅ We need this for the map
          }
        }
      }
    })

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, deal })

  } catch (error) {
    console.error("Fetch Deal Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}