import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { studentId, businessId } = await req.json()

    if (!studentId || !businessId) {
      return NextResponse.json({ success: false, error: "Missing ID or Business" }, { status: 400 })
    }

    // 1. Find the Student (Real Database Check)
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json({ success: false, error: "Invalid Student ID" }, { status: 404 })
    }

    // 2. CHECK: Is the student verified?
    if (!student.isVerified) {
       return NextResponse.json({ success: false, error: "Student is NOT Verified." }, { status: 403 })
    }

    // 3. 📝 LOG THE INTERACTION (Real History Tracking)
    // This creates a permanent record in the 'Redemption' table
    await prisma.redemption.create({
      data: {
        studentId: student.id,
        businessId: businessId,
        // redeemedAt defaults to now()
      }
    })

    // 4. Return success data to the cashier
    return NextResponse.json({
      success: true,
      student: {
        fullName: student.fullName,
        university: student.university,
        image: null // Add profile image here if you have it
      }
    })

  } catch (error) {
    console.error("Redemption Error:", error)
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 })
  }
}