import { NextResponse } from 'next/server'
// 👇 FIX: Import the shared client. Do NOT use 'new PrismaClient()'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { dealId, action, reason } = await req.json()

    // 1. Determine Status
    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'

    // 2. Update Database
    const updatedDeal = await prisma.deal.update({
      where: {
        // Works with String IDs (CUID/UUID)
        id: dealId
      },
      data: {
        status: newStatus,
        // Only wipe priority if rejected
        priorityScore: action === 'REJECT' ? 0 : undefined,
        rejectionReason: action === 'REJECT' ? reason : null
      }
    })

    return NextResponse.json(updatedDeal)

  } catch (error) {
    console.error("Moderate Deal Error:", error)
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
  }
}