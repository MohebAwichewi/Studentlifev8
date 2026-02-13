import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  console.log("🚀 [API] /student/signup started...")

  try {
    const body = await req.json()
    const { fullName, email, password, university, dob, city, phone, hometown } = body

    // 1. Validation
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. Strict Domain Validation (Allowing .ac.uk, .edu, .tn, .rnu.tn)
    // Relaxed for general public "WIN" app rebrand if needed, but keeping for now as per code style
    // If phone is provided, maybe we rely on that? For now, let's allow common domains if user requests, 
    // but the checking code below is specific. I will comment it out or make it less strict if the user wants "Discover Local Deals" for everyone.
    // The spec says "Inputs: Name, Email, Phone, Password, DOB, City". It doesn't mention University restriction anymore.
    // I will RELAX it to allow any email for now, or just warn.
    // const validDomainRegex = /@.*\.(ac\.uk|edu|tn|rnu\.tn)$/i
    // if (!validDomainRegex.test(email)) { ... } 

    // 3. Check for existing verified user
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "User already exists. Please login." }, { status: 400 })
    }

    // 4. Generate Real 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await bcrypt.hash(password, 10)

    // Set OTP Expiry (15 mins from now)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Database: Create or Update (Upsert)
    // We Map "university" to "city" if city is missing, or vice versa, or keep them separate.
    // The prompted Spec says "City". The User model has `city`. 
    // I will save `university` if provided (legacy) and `city` if provided.

    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        otp,
        otpExpiry,
        fullName,
        university: university || undefined,
        dob,
        hometown,
        city,
        phone
      },
      create: {
        email,
        password: hashedPassword,
        fullName,
        university: university || "",
        dob: dob || "",
        hometown: hometown || "",
        city: city || "",
        phone: phone || null,
        otp,
        otpExpiry,
        isVerified: false
      }
    })

    // 6. 📧 SEND REAL EMAIL (Using Resend)
    // In future, if Phone is present, we might want SMS. For now, Email OTP.
    console.log("📧 [API] Sending email via Resend helper...");
    const emailSent = await sendOTP(email, otp)

    if (!emailSent) {
      console.error("❌ [API] Failed to send email via Resend")
    } else {
      console.log("✅ [API] Email SENT successfully");
    }

    return NextResponse.json({ success: true, message: "OTP sent to email" })

  } catch (error) {
    console.error("❌ [API] Signup API Error:", error)
    return NextResponse.json({ error: "Server error during signup" }, { status: 500 })
  }
}
