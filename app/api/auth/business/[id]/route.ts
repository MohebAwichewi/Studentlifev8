import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure ID is parsed as an Integer since your DB uses Int for Business ID
    const businessId = parseInt(params.id)

    if (isNaN(businessId)) {
      return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 })
    }

    // Fetch Business with Deals and Location
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        deals: {
          orderBy: { createdAt: 'desc' }
        },
        locations: {
          take: 1 // Fetch the primary location for the map
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}