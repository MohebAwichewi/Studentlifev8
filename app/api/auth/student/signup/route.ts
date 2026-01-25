import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  console.log("🚀 [API] /student/signup started...") 

  try {
    const body = await req.json()
    const { fullName, email, password, university, dob, hometown } = body

    // 1. Validation
    if (!fullName || !email || !password || !university) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. Strict Domain Validation (Allowing .ac.uk, .edu, .tn, .rnu.tn)
    const validDomainRegex = /@.*\.(ac\.uk|edu|tn|rnu\.tn)$/i
    
    // ⚠️ Note: If testing with gmail, temporarily comment this out.
    if (!validDomainRegex.test(email)) {
       return NextResponse.json({ 
         error: "Access Denied. You must use a valid university email (.ac.uk, .edu, or .tn)" 
       }, { status: 403 })
    }

    // 3. Check for existing verified user
    const existingUser = await prisma.student.findUnique({ where: { email } })
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "User already exists. Please login." }, { status: 400 })
    }

    // 4. Generate Real 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Database: Create or Update (Upsert)
    await prisma.student.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        otp,
        fullName, university, dob, hometown
      },
      create: {
        email,
        password: hashedPassword,
        fullName,
        university,
        dob: dob || "",
        hometown: hometown || "",
        otp,
        isVerified: false
      }
    })

    // 6. 📧 SEND REAL EMAIL (Using student-life.uk Domain)
    console.log("📧 [API] Configuring SMTP Transporter for student-life.uk...");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // mail.student-life.uk
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465
      auth: {
        user: process.env.SMTP_USER, // otp@student-life.uk
        pass: process.env.SMTP_PASS, // Moheb123@
      },
      tls: {
        rejectUnauthorized: false // Helps avoid some server certificate errors
      }
    })

    console.log(`📧 [API] Sending email to ${email} from ${process.env.SMTP_USER}...`);

    await transporter.sendMail({
      from: `"Student.LIFE Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #5856D6; text-align: center;">Welcome to Student.LIFE! 🎓</h2>
          <p style="color: #333; font-size: 16px;">Hello <b>${fullName}</b>,</p>
          <p style="color: #555;">Use the code below to verify your student ID:</p>
          <div style="background: #F4F7FE; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center;">This code will expire in 15 minutes.</p>
        </div>
      `
    })

    console.log("✅ [API] Email SENT successfully");
    return NextResponse.json({ success: true, message: "OTP sent to email" })

  } catch (error) {
    console.error("❌ [API] Signup API Error:", error)
    return NextResponse.json({ error: "Server error during signup" }, { status: 500 })
  }
}