import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // Expires in 15 mins

    // 2. Clear old codes & Save new one to DB
    // We delete any existing codes for this email to prevent clutter
    await prisma.verificationToken.deleteMany({ 
        where: { identifier: email } 
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires
      }
    })

    // 3. Send Email (Real SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: `"Student.LIFE Business" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Partner Verification Code",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Verify your Business Account</h2>
          <p>Use the code below to continue your registration:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #0D3C34;">${otp}</h1>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Send Code Error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}