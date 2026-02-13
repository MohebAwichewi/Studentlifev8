import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { dealId, userId } = await req.json()

    // 1. Check if user already has a code for this deal
    const existing = await prisma.voucher.findFirst({
      where: { dealId, userId }
    })

    if (existing) {
      return NextResponse.json({ code: existing.code, message: "Code retrieved" })
    }

    // 2. Generate Unique Code (Format: DEAL-USER-RANDOM)
    const uniqueCode = `SL-${dealId.slice(-4)}-${userId.slice(-4)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

    // 3. Save to Database
    const voucher = await prisma.voucher.create({
      data: {
        code: uniqueCode,
        userId: userId,
        dealId: dealId
      }
    })

    return NextResponse.json({ code: voucher.code })

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}