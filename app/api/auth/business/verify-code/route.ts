import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    // 1. Find the Token in DB
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code
      }
    })

    // 2. Validate
    if (!record) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    if (new Date() > record.expires) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 })
    }

    // 3. Success - Clean up
    await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: code } }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Verify Error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}