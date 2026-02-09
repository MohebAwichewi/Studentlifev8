import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function POST(req: Request) {
  try {
    const { id, action, reason } = await req.json()

    if (!id || !action) {
      return NextResponse.json({ error: "Missing ID or Action" }, { status: 400 })
    }

    let updateData: any = {}

    // Logic to handle different actions
    if (action === 'APPROVE') {
      updateData = { status: 'ACTIVE', rejectionReason: null }
    } else if (action === 'BAN') {
      updateData = { status: 'BANNED' }
    } else if (action === 'REJECT') {
      updateData = { status: 'REJECTED', rejectionReason: reason }
    } else if (action === 'DELETE') {
      // Permanent Delete (Trash Icon)
      await prisma.business.delete({ where: { id } })
      return NextResponse.json({ success: true, deleted: true })
    } else {
      return NextResponse.json({ error: "Invalid Action" }, { status: 400 })
    }

    const updated = await prisma.business.update({
      where: { id: id },
      data: updateData
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error("Admin Action API Error:", error) // ✅ Helps debugging
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}