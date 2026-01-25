import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json() // action = 'APPROVE' | 'REJECT'

    const status = action === 'APPROVE' ? 'SENT' : 'REJECTED'
    const sentAt = action === 'APPROVE' ? new Date() : null

    const updated = await prisma.pushRequest.update({
      where: { 
        // ⚠️ FIX: Removed parseInt() to be safe with String IDs
        id: id 
      },
      data: { status, sentAt }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Push Action Error:", error)
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}