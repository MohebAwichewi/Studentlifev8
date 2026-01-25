import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const { id, status, plan } = await req.json()

    // 1. Prepare dynamic data object (Only update what is sent)
    const updateData: any = {}
    if (status) updateData.status = status
    if (plan) updateData.plan = plan

    // 2. Update Database
    const updated = await prisma.business.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error("Partner Update Error:", error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}