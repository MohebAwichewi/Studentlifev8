import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch Profile Data
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    const business = await prisma.business.findUnique({
      where: { email },
      // Select fields to be safe (exclude password)
      select: { 
        id: true,
        businessName: true, 
        email: true, 
        phone: true,
        category: true,
        description: true, // ✅ New
        logo: true,        // ✅ New
        coverImage: true,  // ✅ New
        website: true,     // ✅ New
        address: true
      } 
    })
    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 })
  }
}

// PUT: Update Profile Data
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { email, ...updates } = body // Separate email from the rest of the data

    const updated = await prisma.business.update({
      where: { email },
      data: {
        businessName: updates.businessName,
        phone: updates.phone,
        description: updates.description, // ✅ Save Description
        logo: updates.logo,               // ✅ Save Logo URL
        coverImage: updates.coverImage,   // ✅ Save Cover URL
        website: updates.website,
        address: updates.address
      }
    })
    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error("Update Error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}