import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    // ✅ Update Database with verified fields
    const updated = await prisma.business.update({
      where: { id },
      data: {
        businessName: updateData.businessName,
        description: updateData.description,
        city: updateData.city,
        address: updateData.address,
        phone: updateData.phone,
        website: updateData.website,
        googleMapsUrl: updateData.googleMapsUrl,
        googleMapEmbed: updateData.googleMapEmbed,
        category: updateData.category,
        // Only update images if a new value is provided (prevents overwriting with null)
        ...(updateData.logo && { logo: updateData.logo }),
        ...(updateData.coverImage && { coverImage: updateData.coverImage }),
        // Status/Plan can also be updated here if sent
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.plan && { plan: updateData.plan }),
      }
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error("Partner Update Error:", error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}