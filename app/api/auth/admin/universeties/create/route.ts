import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, region, latitude, longitude } = await req.json()
    
    const uni = await prisma.university.create({
      data: {
        name,
        region,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    })
    return NextResponse.json(uni)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}