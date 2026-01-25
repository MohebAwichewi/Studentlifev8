import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const { token, newPassword, userType } = await req.json()

        if (!token || !newPassword || !userType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Find Token
        // We need to find the token and ensure it belongs to the user (via identifier which is email)
        // Prisma `findFirst` is better here since we don't have the identifier in the request necessarily, 
        // strictly speaking we just have token. But `VerificationToken` key is composite. 
        // We'll search by token primarily.

        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token }
        })

        if (!verificationToken) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        // 2. Check Expiry
        if (new Date() > verificationToken.expires) {
            // Cleanup expired
            await prisma.verificationToken.deleteMany({ where: { token } })
            return NextResponse.json({ error: "Token expired" }, { status: 400 })
        }

        const email = verificationToken.identifier

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // 4. Update User Password
        if (userType === 'BUSINESS') {
            const user = await prisma.business.findUnique({ where: { email } })
            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

            await prisma.business.update({
                where: { email },
                data: { password: hashedPassword }
            })
        } else {
            const user = await prisma.student.findUnique({ where: { email } })
            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

            await prisma.student.update({
                where: { email },
                data: { password: hashedPassword }
            })
        }

        // 5. Delete Token (Prevent Replay)
        await prisma.verificationToken.deleteMany({
            where: { identifier: email, token }
        })

        return NextResponse.json({ success: true, message: "Password updated successfully" })

    } catch (error) {
        console.error("Reset Password Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}
