import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

// 1. FOR STUDENTS: Get all active deals
export async function GET(req: Request) {
  try {
    // ✅ FIXED: Query 'deal' table instead of 'offer'
    const deals = await prisma.deal.findMany({
      // removed 'where' filter for status/date because your schema uses String for expiry
      include: { 
        business: {
          select: {
            businessName: true, // ✅ Using correct field name
            email: true,
            category: true
          }
        } 
      }, 
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(deals)
  } catch (error) {
    console.error("GET Deals Error:", error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

// 2. FOR BUSINESSES: Save a new deal
export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Find the business ID
    const business = await prisma.business.findUnique({
      where: { email: session.user.email }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    // ✅ FIXED: Create 'Deal' instead of 'Offer' and match Schema fields
    const newDeal = await prisma.deal.create({
      data: {
        title: body.title,
        description: body.description, 
        // Since 'discount' isn't in your schema, we append it to description or ignore it
        // description: `${body.description} (${body.discount} Off)`, 
        
        category: body.category || "General", // Required field
        expiry: String(body.validUntil),      // Converted to String to match Schema
        businessId: business.id
      }
    })

    return NextResponse.json({ success: true, deal: newDeal })
  } catch (error) {
    console.error("Create Deal Error:", error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}