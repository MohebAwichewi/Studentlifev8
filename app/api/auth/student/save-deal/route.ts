import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, dealId } = await req.json()

    if (!email || !dealId) return NextResponse.json({ error: "Missing info" }, { status: 400 })

    // 1. Find Student ID
    const student = await prisma.student.findUnique({ where: { email } })
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    // 2. Check if already saved
    const existingSave = await prisma.savedDeal.findUnique({
      where: {
        studentId_dealId: {
          studentId: student.id,
          dealId: dealId
        }
      }
    })

    // 3. TOGGLE LOGIC
    if (existingSave) {
      // Unsave (Delete)
      await prisma.savedDeal.delete({
        where: { id: existingSave.id }
      })
      return NextResponse.json({ success: true, status: 'removed' })
    } else {
      // Save (Create)
      await prisma.savedDeal.create({
        data: {
          studentId: student.id,
          dealId: dealId
        }
      })
      return NextResponse.json({ success: true, status: 'saved' })
    }

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}