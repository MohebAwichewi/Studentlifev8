import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 1. GET SINGLE DEAL (For checking details before edit)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dealId = parseInt(id)

    if (isNaN(dealId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { categories: true }
    })

    if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true, deal })
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

// 2. UPDATE DEAL (PUT) - For the "Edit" feature
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Update the deal in the database
    const updatedDeal = await prisma.deal.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        description: body.description,
        discountValue: body.discountValue,
        expiry: body.expiry,
        status: body.status || "ACTIVE",
        // Update Categories
        ...(body.categoryIds && {
          categories: {
            set: body.categoryIds.map((id: any) => ({ id: Number(id) }))
          }
        }),
        // Optional: Update legacy category string if provided
        ...(body.category && { category: body.category })
      }
    })

    return NextResponse.json({ success: true, deal: updatedDeal })
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

// 3. DELETE DEAL (DELETE) - For the "Trash" icon
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.deal.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}