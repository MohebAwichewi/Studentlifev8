import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const email = 'mohebawichewi9@gmail.com' // The email from your screenshot
    const newPassword = '123456' // The password from your screenshot

    // 1. Encrypt the password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 2. Update the user in the database
    const student = await prisma.student.update({
      where: { email: email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Fixed! Password for ${email} is now encrypted. You can login with '${newPassword}'` 
    })

  } catch (error) {
    return NextResponse.json({ error: "User not found or database error" }, { status: 500 })
  }
}