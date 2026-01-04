import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    // 1. Get the ID and new Status from the dashboard button
    const { id, status } = await request.json()

    // 2. Update the database
    const updatedBusiness = await prisma.business.update({
      where: { 
        id: id 
      },
      data: { 
        status: status 
      }
    })

    // 3. Return success
    return NextResponse.json({ success: true, business: updatedBusiness })

  } catch (error) {
    console.error("Update failed:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}