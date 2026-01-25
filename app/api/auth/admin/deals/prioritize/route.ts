import { NextResponse } from 'next/server'
// 👇 FIX: Import the shared client. Do NOT create 'new PrismaClient()' here.
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const { dealId, priorityScore } = await req.json()

    const updatedDeal = await prisma.deal.update({
      where: { 
        // Works with String IDs (UUIDs/CUIDs)
        id: dealId 
      },
      data: { 
        // Ensure the score is stored as an integer
        priorityScore: parseInt(priorityScore) 
      }
    })

    return NextResponse.json(updatedDeal)
  } catch (error) {
    console.error("Prioritize Error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}