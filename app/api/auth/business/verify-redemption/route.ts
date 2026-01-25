import { NextResponse } from 'next/server'
// 👇 CRITICAL FIX: Import shared client. DO NOT use 'new PrismaClient()'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { studentId, businessId } = await req.json()

    if (!studentId || !businessId) {
      return NextResponse.json({ success: false, error: "Missing ID or Business" }, { status: 400 })
    }

    // 1. Find the Student (Using shared client)
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
    await prisma.redemption.create({
      data: {
        studentId: student.id,
        businessId: businessId,
        // redeemedAt defaults to now()
      }
    })

    // 4. Update Business View Count (Optional Analytics)
    // This helps businesses track how many customers they served
    await prisma.business.update({
        where: { id: businessId },
        data: { viewCount: { increment: 1 } }
    })

    // 5. Return success data to the cashier
    return NextResponse.json({
      success: true,
      student: {
        fullName: student.fullName,
        university: student.university,
        image: null 
      }
    })

  } catch (error) {
    console.error("Redemption Error:", error)
    return NextResponse.json({ success: false, error: "Server Error processing ID" }, { status: 500 })
  }
}