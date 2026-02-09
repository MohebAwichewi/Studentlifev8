import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const users = await prisma.student.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                email: true,
                university: true,
                isVerified: true,
                createdAt: true
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Users List Error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
