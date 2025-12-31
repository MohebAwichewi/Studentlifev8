import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // Changed to 'bcryptjs' to match your environment

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 1. Find the business
    const business = await prisma.business.findUnique({
      where: { email }
    })

    // 2. Check if user exists
    if (!business) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // 3. Check if password matches the hash
    const passwordMatch = await bcrypt.compare(password, business.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // 4. (Optional) Check approval status
    // if (business.status !== 'APPROVED') {
    //   return NextResponse.json({ error: 'Account pending approval' }, { status: 403 })
    // }

    // 5. Success
    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      business: {
        id: business.id,
        // ✅ FIXED: Using 'businessName' to match your database schema
        name: business.businessName, 
        email: business.email
      }
    })

  } catch (error) {
    console.error('Business Login Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}