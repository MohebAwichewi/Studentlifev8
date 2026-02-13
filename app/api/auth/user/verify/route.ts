import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  console.log("🚀 [API] /student/verify started...")

  try {
    const body = await req.json()
    const { email, code } = body

    console.log(`🔍 [API] Verifying Student: ${email}`);
    console.log(`🔑 [API] Input Code: '${code}'`);

    // 1. Find the student
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.error("❌ [API] Student not found in DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`💾 [API] Stored Code: '${user.otp}'`);

    // 2. Robust Comparison (Trim spaces + Force String)
    const inputCode = String(code).trim();
    const storedCode = String(user.otp).trim();

    if (inputCode !== storedCode) {
      console.error("❌ [API] Code Mismatch!");
      return NextResponse.json({ error: "Invalid Code" }, { status: 400 })
    }

    // 3. Mark as Verified & Clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null // Clear used OTP
      }
    })

    console.log("✅ [API] Student Verification Successful");

    return NextResponse.json({
      success: true,
      userName: user.fullName
    })

  } catch (error) {
    console.error("❌ [API] STUDENT VERIFY ERROR:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
