import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend';
import crypto from 'crypto'

const resend = new Resend('re_VMjQDLk9_7DzcovXwZs4vR35cijz2t7kq');

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
                    token: token
                }
            },
            update: { expires },
            create: {
                identifier: email,
                token,
                expires
            }
        })

        // 4. Send Email via Resend
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${userType.toLowerCase()}/reset-password?token=${token}`

        const { data, error } = await resend.emails.send({
            from: 'otp@student-life.uk',
            to: [email],
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
        });

        if (error) {
            console.error("Forgot Password Resend Error:", error);
            // Don't leak error to client for security, but log it
        }

        return NextResponse.json({ message: "If account exists, email sent." })

    } catch (error) {
        console.error("Forgot Password Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}

