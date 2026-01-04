import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Generate a secure hash for "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // 2. Update the admin user
    const admin = await prisma.admin.update({
      where: { email: 'admin@s7.com' },
      data: { 
        password: hashedPassword 
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Password for admin@s7.com has been encrypted to 'admin123'",
      newHash: hashedPassword
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update. Does the user 'admin@s7.com' exist?" }, { status: 500 })
  }
}