import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Verify OTP
        if (user.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // 2. Check Expiry
        if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // 3. Mark as Verified & Clear OTP
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                otp: null,
                otpExpiry: null
            }
        });

        // 4. Generate Session Token (JWT)
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: 'USER' },
            SECRET_KEY,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                city: updatedUser.city,
                // Add other necessary user fields
            }
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
