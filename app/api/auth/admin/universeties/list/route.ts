import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      include: { 
        campuses: true,
        notes: { orderBy: { createdAt: 'desc' } } // ✅ Fetch notes, newest first
      }, 
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(universities)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}