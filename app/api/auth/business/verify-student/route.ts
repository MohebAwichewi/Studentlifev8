import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    if (!email && !id) {
      return NextResponse.json({ error: "Missing email or ID" }, { status: 400 })
    }

    // ✅ REAL DATABASE LOOKUP
    // We try to find the student by Email OR by ID based on what was sent
    const student = await prisma.student.findUnique({
      where: email ? { email } : { id }, // Dynamic where clause
      select: {
        id: true,
        fullName: true,
        university: true,
        isVerified: true
      }
    })

    if (!student) {
      return NextResponse.json({ verified: false, error: "Student not found" }, { status: 404 })
    }

    // Check if they are verified (logic depends on your app flow, usually 'isVerified' boolean)
    if (!student.isVerified) {
        return NextResponse.json({ verified: false, error: "Student account exists but is not verified." })
    }

    return NextResponse.json({ 
        verified: true, 
        student: {
            id: student.id,
            fullName: student.fullName,
            university: student.university
        }
    })

  } catch (error) {
    console.error("Verify Student Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}