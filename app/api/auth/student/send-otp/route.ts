import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Imports the helper we just made
import { sendOTP } from '@/lib/email' // Imports your email sender

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // 👇 1. BACKDOOR: If it's the demo email, skip everything and return success immediately
    if (email === 'demo@student.tn') {
      return NextResponse.json({ success: true })
    }

    // --- REAL USER LOGIC STARTS HERE ---

    // 2. Generate a random 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. Set expiry (10 minutes from now)
    const expires = new Date(new Date().getTime() + 10 * 60 * 1000)

    // 4. Save to Database (Delete old codes for this email first to keep it clean)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: expires
      }
    })

    // 5. Send the Email
    const emailSent = await sendOTP(email, otp)

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}