import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to calculate distance (Haversine Formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export async function POST(req: Request) {
  try {
    const { universityId, radius, verifiedOnly } = await req.json()

    // 1. Base Filter: Verified Status
    let whereClause: any = {}
    if (verifiedOnly) whereClause.isVerified = true

    // 2. Geography Filter
    let targetUniversities: string[] = []

    if (universityId) {
      // ✅ FIX: Removed parseInt to support String IDs
      const centerUni = await prisma.university.findUnique({ where: { id: universityId } })
      
      if (centerUni) {
        if (radius > 0) {
          // RADIUS MODE: Find all universities within X km
          const allUnis = await prisma.university.findMany()
          targetUniversities = allUnis
            .filter(u => getDistanceFromLatLonInKm(centerUni.latitude, centerUni.longitude, u.latitude, u.longitude) <= radius)
            .map(u => u.name)
        } else {
          // STRICT MODE: Only this university
          targetUniversities = [centerUni.name]
        }
      }
    }

    // Apply University Filter if we found targets
    if (targetUniversities.length > 0) {
      whereClause.university = { in: targetUniversities }
    }

    // 3. Count Students
    const count = await prisma.student.count({ where: whereClause })

    return NextResponse.json({ count, universitiesIncluded: targetUniversities })

  } catch (error) {
    console.error("Estimate Error:", error)
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 })
  }
}