import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { title, message, filters, estimatedReach } = await req.json()

    await prisma.pushRequest.create({
      data: {
        title,
        message,
        filters: JSON.stringify(filters), // Save filters for history
        targetRadius: filters.radius || 0,
        status: 'SENT', // Admin blasts send immediately
        sentAt: new Date(),
        businessId: null // Null means System/Admin
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 })
  }
}