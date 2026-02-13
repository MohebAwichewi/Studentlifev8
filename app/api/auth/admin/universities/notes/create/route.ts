import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { universityId, content } = await req.json()
    
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 })

    const note = await prisma.universityNote.create({
      data: {
        content,
        universityId: parseInt(universityId)
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
  }
}