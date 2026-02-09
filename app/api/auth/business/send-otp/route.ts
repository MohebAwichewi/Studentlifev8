import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend';

const prisma = new PrismaClient()
const resend = new Resend('re_VMjQDLk9_7DzcovXwZs4vR35cijz2t7kq');

export async function POST(req: Request) {
  console.log("🚀 [API] /send-otp started...")

  try {
    const body = await req.json();
    const { email, name } = body;

    // 1. Generate Random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save OTP to Database
    console.log("💾 [API] Saving OTP to Database...");

    // Check if user exists and is verified
    const existing = await prisma.business.findUnique({ where: { email } });
    if (existing && existing.isVerified) {
      return NextResponse.json({ error: "Email already registered. Please login." }, { status: 400 });
    }

    // Save/Update Business Record
    await prisma.business.upsert({
      where: { email },
      update: { otp },
      create: {
        email,
        otp,
        businessName: name || "Business Partner",
        phone: "",
        password: "" // Consider handling password properly if this is registration
      }
    });

    // 3. Send Email via Resend
    console.log(`📧 [API] Sending email to ${email} via Resend...`);

    const { data, error } = await resend.emails.send({
      from: 'otp@student-life.uk',
      to: [email],
      subject: 'Partner Verification Code',
      text: `Your Student.LIFE verification code is: ${otp}. Please enter this code to verify your account. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0D3C34; text-align: center;">Verify your Business Account</h2>
          <p style="color: #333; font-size: 16px;">Hello <b>${name || 'Partner'}</b>,</p>
          <p style="color: #555;">Use the code below to complete your registration:</p>
          <div style="background: #F4F7FE; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center;">Sent securely from Student.LIFE System.</p>
        </div>
      `
    });

    if (error) {
      console.error("❌ [API] Resend Error:", error);
      return NextResponse.json({ error: "Failed to send email via Resend." }, { status: 500 });
    }

    console.log("✅ [API] Email SENT successfully:", data);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ [API] SERVER ERROR:", error);
    return NextResponse.json({ error: "Failed to send email. Check Server Logs." }, { status: 500 });
  }
}
