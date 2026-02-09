import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, businessName, address, phone, city, postcode, placeId, contactName, latitude, longitude } = body

    // 1. Check if user already exists
    const existingUser = await prisma.business.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (existingUser.password && existingUser.password.length > 10) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Calculate Trial End Date (Real 3 Months from Now)
    const startDate = new Date()
    const trialEndDate = new Date(startDate)
    trialEndDate.setMonth(startDate.getMonth() + 3)

    // 4. Create or Update Business
    const business = await prisma.business.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        businessName,
        address: `${address}, ${city} ${postcode}`,
        city,
        phone,
        placeId,
        latitude: latitude || 0,
        longitude: longitude || 0,
        trialEndsAt: trialEndDate,
        isSubscribed: false,
        status: 'ACTIVE',
        locations: {
          create: {
            name: "Main Branch",
            address: `${address}, ${city} ${postcode}`,
            lat: latitude || 0,
            lng: longitude || 0
          }
        }
      },
      create: {
        email,
        password: hashedPassword,
        businessName,
        address: `${address}, ${city} ${postcode}`,
        city,
        phone,
        placeId,
        latitude: latitude || 0,
        longitude: longitude || 0,
        trialEndsAt: trialEndDate,
        isSubscribed: false,
        locations: {
          create: {
            name: "Main Branch",
            address: `${address}, ${city} ${postcode}`,
            lat: latitude || 0,
            lng: longitude || 0
          }
        }
      }
    })

    // Return the ID so the frontend can log them in immediately
    return NextResponse.json({
      success: true,
      businessId: business.id,
      businessName: business.businessName
    })

  } catch (error) {
    console.error("Registration Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}