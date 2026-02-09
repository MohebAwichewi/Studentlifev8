import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET PROFILE (Using POST to match your structure)
export async function POST(req: Request) {
  try {
    // ✅ FIX: Use businessId instead of email (easier for frontend)
    const { businessId } = await req.json()

    const business = await prisma.business.findUnique({
      where: { id: businessId }, // Lookup by ID
      select: {
        id: true,
        businessName: true,
        email: true,
        phone: true,
        category: true,
        description: true,
        logo: true,
        coverImage: true,
        website: true,
        address: true,
        googleMapsUrl: true,
        googleMapEmbed: true // ✅ Added
      }
    })
    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 })
  }
}

// UPDATE PROFILE (PUT)
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    // ✅ FIX: Use businessId to identify who to update
    const { businessId, ...updates } = body

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        businessName: updates.businessName,
        phone: updates.phone,
        description: updates.description,
        logo: updates.logo,
        coverImage: updates.banner || updates.coverImage, // ✅ Map banner to coverImage
        website: updates.website,
        address: updates.address,
        googleMapsUrl: updates.googleMapsUrl,
        googleMapEmbed: updates.googleMapEmbed // ✅ Added
      }
    })
    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error("Update Error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}