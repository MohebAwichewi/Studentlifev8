import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // 1. Get data from the request
    const { name, email, password, category, description } = await req.json()

    // 2. Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email }
    })

    if (existingBusiness) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Create the business in the database
    const newBusiness = await prisma.business.create({
      data: {
        // ✅ FIXED: Map the variable 'name' to the DB column 'businessName'
        businessName: name, 
        email,
        password: hashedPassword,
        category: category || 'Food', // Default if not provided
        description: description || '',
        status: 'PENDING'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully',
      business: {
        id: newBusiness.id,
        email: newBusiness.email
      }
    })

  } catch (error) {
    console.error('Signup Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}