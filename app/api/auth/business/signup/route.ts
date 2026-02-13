import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Destructure all possible fields to prevent "undefined" errors
    const { businessName, email, password, address, phone, category, city } = body

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // 1. Check if user already exists
    const existing = await prisma.business.findUnique({
      where: { email: email }
    })

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Create Business in Database (Stripe Removed)
    // 3. Save to Database (No Stripe, just DB)
    const business = await prisma.business.create({
      data: {
        businessName,
        email,
        password: hashedPassword,
        address: address, // Strict: No default
        phone: phone || "",
        city: city, // Strict: No default
        category: category || "General",
        stripeCustomerId: `legacy_${Date.now()}`, // Dummy value as Stripe is removed
        stripeSubscriptionId: null,
        isTrialActive: true,
        // ✅ 90 Days Free Trial
        // Stripe fields are nullable in schema, pass null or omit if optional
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        isTrialActive: true,
        // ✅ CRITICAL: Ensure this matches your Prisma Schema exactly
        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        plan: 'MONTHLY',
        isSubscribed: false,
      }
    })

    return NextResponse.json({
      success: true,
      businessId: business.id,
      businessName: business.businessName,
      email: business.email
    })

  } catch (error: any) {
    console.error("Signup Critical Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
