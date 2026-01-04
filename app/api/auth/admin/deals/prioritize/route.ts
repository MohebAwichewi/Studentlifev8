import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const { dealId, priorityScore } = await req.json()

    const updatedDeal = await prisma.deal.update({
      where: { id: parseInt(dealId) },
      data: { priorityScore: parseInt(priorityScore) }
    })

    return NextResponse.json(updatedDeal)
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}