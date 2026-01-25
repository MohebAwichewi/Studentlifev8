import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { businessId, price } = await req.json()

    // 1. Validate Input (Price must be positive)
    if (!businessId || price < 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // 2. Update Business Record
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { 
        customPlanPrice: parseFloat(price) // Save as Float (e.g. 15.00)
      }
    })

    return NextResponse.json({ success: true, business: updatedBusiness })

  } catch (error) {
    console.error("Admin Update Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}