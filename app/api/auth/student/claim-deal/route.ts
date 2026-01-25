import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, dealId } = body

    if (!email || !dealId) {
      console.error("Missing input:", { email, dealId })
      return NextResponse.json({ error: "Missing email or deal ID" }, { status: 400 })
    }

    // 1. Find Student
    const student = await prisma.student.findUnique({
      where: { email }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // 2. Find Deal (Handle ID as Number)
    const dealIdInt = Number(dealId)
    if (isNaN(dealIdInt)) {
        return NextResponse.json({ error: "Invalid Deal ID format" }, { status: 400 })
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealIdInt }
    })

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    // 3. Check for Existing Voucher
    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        studentId: student.id,
        dealId: deal.id
      }
    })

    if (existingVoucher) {
      return NextResponse.json({ 
        success: true, 
        code: existingVoucher.code, 
        message: "Code retrieved" 
      })
    }

    // 4. Generate Unique Code (Safe for Int IDs)
    // Format: SL-{DEAL_ID}-{STUDENT_FIRST_2}-{RANDOM_4}
    const dealPart = deal.id.toString().padStart(3, '0') // e.g. "005"
    const studentPart = student.id.substring(0, 2).toUpperCase() // e.g. "JO"
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() // e.g. "X9Y1"
    
    const uniqueCode = `SL-${dealPart}-${studentPart}-${randomPart}`

    // 5. Save to Database
    const voucher = await prisma.voucher.create({
      data: {
        code: uniqueCode,
        studentId: student.id,
        dealId: deal.id,
        isUsed: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      code: voucher.code 
    })

  } catch (error: any) {
    // Log the actual error to your server console for debugging
    console.error("Claim Deal Error Detailed:", error)
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 })
  }
}