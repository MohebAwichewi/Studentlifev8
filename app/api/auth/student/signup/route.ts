import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fullName, email, password, university, dob, hometown } = body

    // 1. Basic Validation: Check if fields exist
    if (!fullName || !email || !password || !university) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. 🔒 STRICT DOMAIN VALIDATION (The New Feature)
    // This Regex allows: .edu, .ac.uk, .tn (Tunisia), .rnu.tn (Tunisian Universities)
    // It blocks: .com, .net, .org (like gmail.com, yahoo.com)
    const validDomainRegex = /@.*\.(ac\.uk|edu|tn|rnu\.tn)$/i

    if (!validDomainRegex.test(email)) {
      return NextResponse.json({ 
        error: "Access Denied. You must use a valid university email (.ac.uk, .edu, or .tn)" 
      }, { status: 403 })
    }

    // 3. Check if user already exists
    const existingUser = await prisma.student.findUnique({
      where: { email: email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email." }, { status: 400 })
    }

    // 4. Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Create Student (Now safely validated)
    const newStudent = await prisma.student.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        university,
        dob: dob || "", // Optional field handling
        hometown: hometown || "", // Optional field handling
        isVerified: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully", 
      student: { id: newStudent.id, email: newStudent.email } 
    })

  } catch (error) {
    console.error("Signup API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}