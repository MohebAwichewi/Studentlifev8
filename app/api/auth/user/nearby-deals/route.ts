import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real Earth Radius for Haversine Formula calculations
const EARTH_RADIUS_KM = 6371

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json()

    if (!lat || !lng) {
      return NextResponse.json({ error: "GPS Location required" }, { status: 400 })
    }

    // 1. Get all businesses with their deals and locations
    const businesses = await prisma.business.findMany({
      include: {
        locations: true,
        deals: {
          where: { isActive: true }
        }
      }
    })

    // 2. Filter using Real Math (Haversine)
    const nearbyDeals: any[] = []

    businesses.forEach((biz) => {
      // 1. Check Main Business Location
      if (biz.latitude && biz.longitude) {
        const distance = getDistanceFromLatLonInKm(lat, lng, biz.latitude, biz.longitude)
        if (distance <= 15) {
          biz.deals.forEach(deal => {
            nearbyDeals.push({
              ...deal,
              distance: distance.toFixed(1) + ' km',
              businessName: biz.businessName,
              locationName: "Main Store", // Or biz.city
              businessId: biz.id,
              // Ensure logo is passed if needed, though deals usually include business relation
              logo: biz.logo
            })
          })
        }
      }

      // 2. Check Additional Branch Locations
      biz.locations.forEach((loc) => {
        const distance = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng)

        // If within 15km, add the deal to the list
        if (distance <= 15) {
          biz.deals.forEach(deal => {
            // Avoid duplicates if main location and branch are same (unlikely but possible)
            // For now, allow all valid locations
            nearbyDeals.push({
              ...deal,
              distance: distance.toFixed(1) + ' km', // Real calculated distance
              businessName: biz.businessName,
              locationName: loc.name,
              // Add businessId so the link works
              businessId: biz.id,
              logo: biz.logo
            })
          })
        }
      })
    })

    // 3. Sort by nearest first
    nearbyDeals.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

    return NextResponse.json({
      success: true,
      deals: nearbyDeals,
      count: nearbyDeals.length
    })

  } catch (error) {
    console.error("Nearby API Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}