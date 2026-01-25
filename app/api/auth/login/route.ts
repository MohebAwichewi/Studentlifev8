import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // ✅ Changed from 'bcrypt' to 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // 1. Check Admin Table
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return NextResponse.json({ error: 'User not found in Admin table' }, { status: 404 })
    }

    // 2. Verify Password
    const match = await bcrypt.compare(password, admin.password)

    if (!match) {
      return NextResponse.json({ error: 'Incorrect Password' }, { status: 401 })
    }

    // 3. Success & Set Cookie
    const response = NextResponse.json({ success: true })
    
    // Set a secure HTTP-only cookie
    response.cookies.set('admin_token', 'secure_session', { 
        path: '/', 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400 // 1 day
    })
    
    return response

  } catch (error) {
    console.error("Admin Login Error:", error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}