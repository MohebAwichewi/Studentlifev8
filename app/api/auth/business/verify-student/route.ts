import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  try {
    // Look up the student in your 'Student' table
    const student = await prisma.student.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
  
        createdAt: true
      }
    })

    if (student) {
      return NextResponse.json({ verified: true, student })
    } else {
      return NextResponse.json({ verified: false })
    }
  } catch (error) {
    return NextResponse.json({ verified: false, error: 'DB Error' }, { status: 500 })
  }
}