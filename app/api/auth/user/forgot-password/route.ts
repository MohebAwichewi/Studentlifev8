import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTP } from '@/lib/email';
import bcrypt from 'bcryptjs';

// 1. Request OTP for Password Reset
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return success even if user not found to prevent enumeration, or return specific error if needed.
            // For UX, we usually say "If an account exists..."
            return NextResponse.json({ success: true, message: "OTP sent if account exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.update({
            where: { email },
            data: { otp, otpExpiry }
        });

        await sendOTP(email, otp);

        return NextResponse.json({ success: true, message: "OTP sent" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 2. Verify OTP & Reset Password
export async function PUT(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // Check Expiry (if field available, otherwise skip for simple implementation)
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null, // Clear OTP
                otpExpiry: null
            }
        });

        return NextResponse.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
