import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { dealId, action, reason } = await req.json() // ✅ Added 'reason'

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
    
    const updatedDeal = await prisma.deal.update({
      where: { id: parseInt(dealId) },
      data: { 
        status: newStatus,
        priorityScore: action === 'REJECT' ? 0 : undefined,
        rejectionReason: action === 'REJECT' ? reason : null // ✅ Save/Clear reason
      }
    })

    return NextResponse.json(updatedDeal)

  } catch (error) {
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
  }
}