import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, businessName, address, phone, city, postcode, placeId, contactName } = body

    // 1. Check if user already exists
    const existingUser = await prisma.business.findUnique({
      where: { email }
    })

    if (existingUser) {
      // If account exists AND has a password, it's a real account -> Error
      if (existingUser.password && existingUser.password.length > 10) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
      // Otherwise, it's a placeholder from 'send-otp', so we PROCEED to update it.
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Calculate Trial End Date (Real 3 Months from Now)
    const startDate = new Date()
    const trialEndDate = new Date(startDate)
    trialEndDate.setMonth(startDate.getMonth() + 3) // Adds exactly 3 months

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
        trialEndsAt: trialEndDate,
        isSubscribed: false,
        status: 'ACTIVE' // Activate the account
      },
      create: {
        email,
        password: hashedPassword,
        businessName,
        address: `${address}, ${city} ${postcode}`,
        city,
        phone,
        placeId,
        trialEndsAt: trialEndDate,
        isSubscribed: false
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