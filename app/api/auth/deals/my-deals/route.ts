import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 1. Find the Business ID
    const business = await prisma.business.findUnique({
      where: { email }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // 2. Find ALL deals belonging to this business
    const deals = await prisma.deal.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, deals })

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}