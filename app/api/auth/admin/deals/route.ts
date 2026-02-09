import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch ALL deals (Newest first)
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: { businessName: true }
        }
      }
    })
    return NextResponse.json(deals)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, title, description, category, discountValue, priorityScore, status, expiry, redemptionType, redemptionLink, isMultiUse, isUrgent, image } = body

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const updated = await prisma.deal.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        category,
        discountValue,
        priorityScore: priorityScore ? Number(priorityScore) : 0,
        status,
        expiry: expiry === 'limitless' ? null : (expiry ? new Date(expiry) : undefined), // Handle null explicit or undefined
        redemptionType,
        isMultiUse: Boolean(isMultiUse),
        isUrgent: Boolean(isUrgent),
        redemptionLink, // ✅ NEW
        image
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Deal Update Error:", error)
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
  }
}