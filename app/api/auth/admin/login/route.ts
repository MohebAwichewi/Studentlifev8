import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

    // 3. Success
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', 'secure_session', { path: '/', maxAge: 86400 })
    return response

  } catch (error) {
    console.error('Admin Login Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Server Error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}