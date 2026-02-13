import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // 1. Extract data (Accept 'region' from snippet 1, and 'lat/lng' from snippet 2)
    const { name, region, lat, lng } = await req.json()

    // 2. Validation: Check if critical fields are empty
    // (We allow region to be optional, but you can add !region here if strictly required)
    if (!name || !lat || !lng) {
      return NextResponse.json({ error: "Missing required fields (Name, Lat, or Lng)" }, { status: 400 })
    }

    // 3. Create in Database
    const university = await prisma.university.create({
      data: {
        name,
        region: region, // Strict: No default
        // Convert string inputs to floats for the database
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      }
    })

    return NextResponse.json({ success: true, university })

  } catch (error) {
    console.error("Create University Error:", error)
    return NextResponse.json({ error: "Server Error: Could not save to database" }, { status: 500 })
  }
}