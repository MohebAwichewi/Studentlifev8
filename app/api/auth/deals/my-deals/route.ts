import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, businessId } = await req.json()

    if (!email && !businessId) {
      return NextResponse.json({ error: "Email or Business ID missing" }, { status: 400 })
    }

    let business;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } })
    } else {
      business = await prisma.business.findUnique({ where: { email } })
    }

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 401 })
    }

    // 2. Fetch Deals
    const deals = await prisma.deal.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, deals })

  } catch (error: any) {
    console.error("My-Deals Error:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}