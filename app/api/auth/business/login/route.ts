import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
// 👇 FIX: Import the shared connection. 
// Do NOT use 'import { PrismaClient } from ...' or 'new PrismaClient()'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 1. Find Business (Using shared client)
    const business = await prisma.business.findUnique({ where: { email } })

    if (!business) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 })
    }

    // 2. Check Password
    // Note: If you manually inserted data without hashing, this might fail. 
    // This expects passwords hashed with bcrypt during signup.
    const isValid = await bcrypt.compare(password, business.password)

    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
    }

    // 3. Success
    return NextResponse.json({
      success: true,
      businessId: business.id,
      businessName: business.businessName,
      status: business.status // ✅ Return status so frontend can redirect
    })

  } catch (error) {
    console.error("Business Login Error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}