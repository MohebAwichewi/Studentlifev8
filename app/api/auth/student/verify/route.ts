import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    // 1. Find the student
    const student = await prisma.student.findUnique({ where: { email } })

    if (!student) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 2. Check if OTP matches
    if (student.otp !== code) {
      return NextResponse.json({ error: "Invalid Code" }, { status: 400 })
    }

    // 3. Mark as Verified & Clear OTP
    await prisma.student.update({
      where: { email },
      data: { 
        isVerified: true,
        otp: null // Clear used OTP
      }
    })

    return NextResponse.json({ success: true, studentName: student.fullName })

  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}