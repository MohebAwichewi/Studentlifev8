import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"

// 1. FOR STUDENTS: Get all deals
export async function GET(req: Request) {
  try {
    const deals = await prisma.deal.findMany({
      include: { business: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(deals)
  } catch (error) {
    console.error("Fetch Error:", error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

// 2. FOR BUSINESSES: Create a new deal
export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Find the business using the email from the logged-in session
    const business = await prisma.business.findUnique({
      where: { email: session.user.email }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Save the Deal (Using 'prisma.deal' to match your schema)
    const newDeal = await prisma.deal.create({
      data: {
        title: body.title,
        description: body.description,
        category: "Food",       // Default required by your schema
        expiry: body.validUntil, // Your schema uses String for expiry
        businessId: business.id // Matches Int
      }
    })

    return NextResponse.json({ success: true, deal: newDeal })
  } catch (error) {
    console.error("Create Error:", error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}