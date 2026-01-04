import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Fetch all APPROVED deals with their Business Locations
    const activeDeals = await prisma.deal.findMany({
      where: { status: 'APPROVED' },
      include: {
        business: {
          include: {
            locations: true // This contains the real Lat/Lng
          }
        }
      }
    })

    // 2. Format data for Google Maps
    // If a business has 3 locations, we show the deal at ALL 3 locations.
    const mapPins: any[] = []

    activeDeals.forEach(deal => {
      if (deal.business.locations.length > 0) {
        deal.business.locations.forEach(loc => {
          mapPins.push({
            id: `${deal.id}-${loc.id}`, // Unique ID for map key
            dealId: deal.id,
            title: deal.title,
            category: deal.category,
            businessName: deal.business.businessName,
            businessId: deal.business.id,
            lat: loc.lat,
            lng: loc.lng,
            locationName: loc.name
          })
        })
      }
    })

    return NextResponse.json({ success: true, pins: mapPins })

  } catch (error) {
    console.error("Map Data Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}