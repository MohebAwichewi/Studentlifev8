import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // 1. Find User
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

    // 3. Success
    const { password: _, ...studentProfile } = student
    
    return NextResponse.json({ 
      success: true, 
      email: student.email,
      user: studentProfile 
    })

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}