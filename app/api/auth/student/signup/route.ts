import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  console.log("🚀 [API] /student/signup started...")

  try {
    const formData = await req.formData()

    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const university = formData.get('university') as string
    const dob = formData.get('dob') as string || ""
    const hometown = formData.get('hometown') as string || ""
    const idImage = formData.get('idImage') as File | null

    // 1. Validation
    if (!fullName || !email || !password || !university) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. Email Domain Validation (Relaxed for ID Card Uploads)
    const validDomainRegex = /@.*\.(ac\.uk|edu|tn|rnu\.tn)$/i
    const hasUniversityEmail = validDomainRegex.test(email)
    const hasIdCard = !!idImage

    // ✅ CHECK: Strict "OR" Logic
    // Scenario A: ID Card Uploaded -> Allow ANY email (skip domain check)
    // Scenario B: No ID Card -> Enforce University Domain
    if (!hasIdCard && !hasUniversityEmail) {
      return NextResponse.json({
        error: "Access Denied. You must use a valid university email (.ac.uk, .edu, or .tn) or upload your Student ID card."
      }, { status: 403 })
    }

    console.log(`✅ [API] Email validation passed - University email: ${hasUniversityEmail}, ID uploaded: ${hasIdCard}`)


    // 3. Check for existing verified user
    const existingUser = await prisma.student.findUnique({ where: { email } })
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "User already exists. Please login." }, { status: 400 })
    }

    // 4. Handle ID Card Upload
    let idCardUrl = null
    if (idImage) {
      try {
        const bytes = await idImage.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const timestamp = Date.now()
        const filename = `id_${timestamp}_${idImage.name}`
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'ids', filename)

        // Save file
        await writeFile(filepath, buffer)
        idCardUrl = `/uploads/ids/${filename}`
        console.log("✅ [API] ID Card uploaded:", idCardUrl)
      } catch (uploadError) {
        console.error("❌ [API] ID upload failed:", uploadError)
        // Continue without ID - admin can request re-upload
      }
    }

    // 5. Generate Real 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. Database: Create or Update (Upsert)
    await prisma.student.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        otp,
        fullName,
        university,
        dob,
        hometown,
        idCardUrl
      },
      create: {
        email,
        password: hashedPassword,
        fullName,
        university,
        dob,
        hometown,
        otp,
        isVerified: false,
        idCardUrl
      }
    })

    // 7. 📧 SEND REAL EMAIL (Using Resend)
    console.log("📧 [API] Sending email via Resend helper...");
    const emailSent = await sendOTP(email, otp)

    if (!emailSent) {
      console.error("❌ [API] Failed to send email via Resend")
    } else {
      console.log("✅ [API] Email SENT successfully");
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
      idUploaded: !!idCardUrl
    })

  } catch (error) {
    console.error("❌ [API] Signup API Error:", error)
    return NextResponse.json({ error: "Server error during signup" }, { status: 500 })
  }
}