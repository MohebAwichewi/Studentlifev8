import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const { campusId, status } = await req.json()

    if (!campusId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const updatedCampus = await prisma.campus.update({
      where: { id: parseInt(campusId) },
      data: { status }
    })

    return NextResponse.json(updatedCampus)
  } catch (error) {
    console.error("Update Campus Error:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}