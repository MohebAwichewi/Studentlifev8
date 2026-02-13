import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { email, oldPassword, newPassword } = await req.json()

        if (!email || !oldPassword || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // 1. Find Admin
        const admin = await prisma.admin.findUnique({ where: { email } })
        if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 })

        // 2. Verify Old Password
        const isValid = await bcrypt.compare(oldPassword, admin.password)
        if (!isValid) return NextResponse.json({ error: "Incorrect old password" }, { status: 401 })

        // 3. Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // 4. Update
        await prisma.admin.update({
            where: { email },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Change Password Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}
