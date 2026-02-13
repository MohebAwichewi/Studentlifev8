import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper: Haversine Formula for server-side distance validation
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export async function POST(req: Request) {
  try {
    const { email, dealId, userLat, userLng } = await req.json()

    // 1. Get User & Deal
    const user = await prisma.user.findUnique({ where: { email } })
    const deal = await prisma.deal.findUnique({
      where: { id: Number(dealId) },
      include: { business: { include: { locations: true } } }
    })

    if (!user || !deal) return NextResponse.json({ success: false, error: "Invalid Request" }, { status: 400 })

    // 2. Validate Location (Server-Side Check)
    // We check against ALL business locations. If user is close to ANY, it passes.
    let isNearby = false
    const MAX_DISTANCE_METERS = 25 // 15m + 10m buffer for GPS inaccuracy

    // If business has no specific locations set, fallback or skip check? 
    // For now, assuming locations exist if it's a physical redeem.
    if (deal.business.locations.length > 0) {
      for (const loc of deal.business.locations) {
        const dist = getDistanceFromLatLonInM(userLat, userLng, loc.lat, loc.lng)
        if (dist <= MAX_DISTANCE_METERS) {
          isNearby = true
          break
        }
      }
      if (!isNearby) {
        return NextResponse.json({ success: false, error: "You are too far from the store!" }, { status: 403 })
      }
    }

    // 3. Handle Cooldown (If Multi-Use)
    if (deal.isMultiUse) {
      const lastRedemption = await prisma.redemption.findFirst({
        where: { userId: user.id, dealId: deal.id },
        orderBy: { createdAt: 'desc' }
      })

      if (lastRedemption) {
        const now = new Date()
        const timeDiff = (now.getTime() - lastRedemption.createdAt.getTime()) / 1000 / 60 // minutes

        if (timeDiff < 5) {
          const timeLeft = Math.ceil(5 - timeDiff)
          return NextResponse.json({ success: false, error: `Cooldown active. Wait ${timeLeft} mins.` }, { status: 429 })
        }
      }
    } else {
      // Single Use Check
      const existing = await prisma.redemption.findFirst({
        where: { userId: user.id, dealId: deal.id }
      })
      if (existing) return NextResponse.json({ success: false, error: "Deal already used." }, { status: 403 })
    }

    // 4. Update Ticket Status (mark as used)
    try {
      // Find the oldest unused ticket for this user & deal
      const ticket = await prisma.ticket.findFirst({
        where: {
          userId: user.id,
          dealId: deal.id,
          isUsed: false
        },
        orderBy: { createdAt: 'asc' }
      });

      if (ticket) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            isUsed: true,
            usedAt: new Date()
          }
        });
      }
    } catch (e) {
      console.error("Ticket update failed (Non-fatal)", e);
    }

    // 5. Log Redemption
    await prisma.redemption.create({
      data: {
        userId: user.id,
        dealId: deal.id
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Redemption Error", error)
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 })
  }
}
