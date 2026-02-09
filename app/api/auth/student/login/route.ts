import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// 👇 FIX: Use the shared client. DO NOT use 'new PrismaClient()'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validation (Kept your logic)
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // 1. Find the Student (Using shared client)
    const student = await prisma.student.findUnique({
      where: { email: email }
    })

    if (!student) {
      return NextResponse.json({ error: "No account found. Please register." }, { status: 404 })
    }

    // 2. Check Password
    const isValid = await bcrypt.compare(password, student.password)

    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
    }

    // 3. Success (Generate Token)
    const { password: _, ...studentProfile } = student

    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: studentProfile
    })

  } catch (error) {
    console.error("Student Login Error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}