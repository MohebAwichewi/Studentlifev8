import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  console.log("🚀 [API] /verify-otp started...")

  try {
    const body = await req.json()
    const { email, code } = body

    console.log(`🔍 [API] Verifying for: ${email}`);
    console.log(`🔑 [API] Input Code: '${code}'`);

    // 1. Find the business
    const business = await prisma.business.findUnique({ where: { email } })

    if (!business) {
      console.error("❌ [API] Business not found in DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`💾 [API] Stored Code: '${business.otp}'`);

    // 2. Robust Comparison (Trim spaces + Force String)
    const inputCode = String(code).trim();
    const storedCode = String(business.otp).trim();

    if (inputCode !== storedCode) {
      console.error("❌ [API] Code Mismatch!");
      return NextResponse.json({ error: "Invalid Code" }, { status: 400 })
    }

    // 3. Mark as Verified & Clear OTP
    await prisma.business.update({
      where: { email },
      data: { 
        isVerified: true,
        otp: null // Clear used OTP
      }
    })

    console.log("✅ [API] Verification Successful");
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("❌ [API] VERIFY ERROR:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}