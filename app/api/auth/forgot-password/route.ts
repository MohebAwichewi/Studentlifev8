import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Email Transporter (Reusing existing config from send-otp)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function POST(req: Request) {
    try {
        const { email, userType } = await req.json() // userType: 'BUSINESS' or 'STUDENT'

        if (!email || !userType) {
            return NextResponse.json({ error: "Email and User Type required" }, { status: 400 })
        }

        // 1. Check if user exists
        let user = null
        if (userType === 'BUSINESS') {
            user = await prisma.business.findUnique({ where: { email } })
        } else {
            user = await prisma.student.findUnique({ where: { email } })
        }

        if (!user) {
            // SECURITY: Don't reveal user doesn't exist
            return NextResponse.json({ message: "If account exists, email sent." })
        }

        // 2. Generate Token
        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 3600 * 1000) // 1 Hour

        // 3. Save Token via Prisma (Upsert to replace old tokens)
        await prisma.verificationToken.upsert({
            where: {
                identifier_token: {
                    identifier: email,
                    token: token // This is technically unique constraint, but we want to clear old ones ideally. 
                    // However, standard NextAuth VerificationToken table is usually insert-only or specific cleanup.
                    // We'll just create a new one. Upsert requires unique combo.
                    // Actually, let's delete old ones first to keep it clean.
                }
            },
            update: { expires }, // Fallback, won't happen if we use random token
            create: {
                identifier: email,
                token,
                expires
            }
        })

        // Better approach: Clean old unique tokens for this email if possible, or just create.
        // Since default unique is [identifier, token], we can have multiple tokens per email.
        // That's fine.

        // 4. Send Email
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${userType.toLowerCase()}/reset-password?token=${token}`

        await transporter.sendMail({
            from: `"Student.LIFE Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your Password',
            text: `Reset your password by visiting this link: ${resetUrl}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0D3C34; text-align: center;">Password Reset Request</h2>
          <p style="color: #555;">You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center;">Link valid for 1 hour. If you didn't request this, please ignore.</p>
        </div>
      `
        })

        return NextResponse.json({ message: "If account exists, email sent." })

    } catch (error) {
        console.error("Forgot Password Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}
