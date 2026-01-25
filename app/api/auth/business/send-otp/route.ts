import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

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

    // 3. Send Email
    // Since you are on Vercel, ensure SMTP_HOST points to the IP or correct hostname of your cPanel server
    console.log("📧 [API] Configuring SMTP Transporter...");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // Use true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Fixes some certificate errors
      },
      connectionTimeout: 10000, // 10 seconds timeout
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    // Verify connection first (Debugging Step)
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.error("❌ [API] SMTP Connection Check Failed:", error);
          reject(error);
        } else {
          console.log("✅ [API] SMTP Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    console.log(`📧 [API] Sending email to ${email}...`);

    await transporter.sendMail({
      from: `"Student.LIFE Security" <${process.env.SMTP_USER}>`,
      to: email,
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

    console.log("✅ [API] Email SENT successfully");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ [API] SERVER ERROR:", error);
    return NextResponse.json({ error: "Failed to send email. Check SMTP settings." }, { status: 500 });
  }
}