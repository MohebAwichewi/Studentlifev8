import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()

    if (!businessId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    // ✅ REAL ATOMIC INCREMENT
    // efficient database operation that prevents race conditions
    await prisma.business.update({
      where: { id: businessId },
      data: {
        viewCount: {
          increment: 1 // Adds +1 directly in the database engine
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    // We don't return 500 to the client to avoid blocking the UI 
    // if analytics fail, but we log it internally.
    console.error("Analytics Error:", error)
    return NextResponse.json({ success: false })
  }
}