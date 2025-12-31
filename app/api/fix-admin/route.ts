import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET() {
  try {
    const email = "admin@s7.tn"
    const password = "admin" // Keeping it simple for the fix

    // 1. DELETE existing admin (Clear the broken data)
    await prisma.admin.deleteMany({
      where: { email: email }
    })

    // 2. Generate a fresh hash
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Create the new clean Admin
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword, // Storing the hash correctly
        role: "CEO"
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "✅ FIXED! Old admin deleted. New Admin Created.", 
      credentials: {
        email: email,
        password: password
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}