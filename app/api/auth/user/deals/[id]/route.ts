import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ FIX: Type 'params' as a Promise
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // <--- Updated Type
) {
  try {
    const { id } = await params // <--- Await the params here
    const dealId = parseInt(id)

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid Deal ID" }, { status: 400 })
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            logo: true,
            category: true,
            locations: true,
            latitude: true,      // ✅ Added
            longitude: true,     // ✅ Added
            googleMapsUrl: true, // ✅ Added
            googleMapEmbed: true // ✅ Added for Embed Map Support 
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