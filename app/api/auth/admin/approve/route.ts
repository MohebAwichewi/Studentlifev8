import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id, type, action, reason } = await req.json()

    // IF Approved -> ACTIVE. IF Rejected -> REJECTED.
    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'

    console.log(`ADMIN ACTION: ${action} ${type} ${id}`)

    if (type === 'business') {
      await prisma.business.update({
        where: { id },
        data: { 
            status: newStatus,
            rejectionReason: reason || null
        }
      })
    } 
    else if (type === 'deal') {
      await prisma.deal.update({
        where: { id: Number(id) }, // Deals usually have Number IDs
        data: { 
            status: newStatus,
            rejectionReason: reason || null
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Approval Error:", error)
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}