import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, discount, description, validUntil } = body

    // 1. Find a Business to attach this deal to (For demo, picking the first one)
    // In a real app with Auth, you would use the logged-in user's business ID
    const business = await prisma.business.findFirst()

    if (!business) {
      return NextResponse.json({ error: "No Business Account Found" }, { status: 404 })
    }

    // 2. Create the Deal in the Database
    const newDeal = await prisma.deal.create({
      data: {
        title,
        description,
        discountValue: discount,
        businessId: business.id,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Default image or handle upload
        // If you have a validUntil column:
        // validUntil: new Date(validUntil), 
      }
    })

    return NextResponse.json({ success: true, deal: newDeal })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
  }
}