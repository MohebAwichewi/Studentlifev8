import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, category, expiry, image, email } = body

    // 1. Validation
    if (!title || !image || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Find the Business ID using the Email
    // (This ensures we link the deal to the correct account)
    const business = await prisma.business.findUnique({
      where: { email }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business account not found' }, { status: 404 })
    }

    // 3. Create the Deal in the Database
    const newDeal = await prisma.deal.create({
      data: {
        title,
        description,
        category,
        expiry,
        image,
        businessId: business.id // 👈 This links the deal to the business!
      }
    })

    return NextResponse.json({ success: true, deal: newDeal })

  } catch (error) {
    console.error('Create Deal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}