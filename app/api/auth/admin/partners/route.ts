import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // ⚠️ Security Note: In a production app, verify the Admin session/token here!
    
    // Fetch all businesses, sorted by newest first
    const partners = await prisma.business.findMany({
      select: {
        id: true,
        businessName: true,
        email: true,
        customPlanPrice: true,
        isSubscribed: true,
        plan: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, partners })

  } catch (error) {
    console.error("Fetch Partners Error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}