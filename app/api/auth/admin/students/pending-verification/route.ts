import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch students who uploaded ID but are not yet verified
        const pendingStudents = await prisma.student.findMany({
            where: {
                isVerified: false,
                idCardUrl: {
                    not: null
                }
            },
            orderBy: {
                createdAt: 'asc' // Oldest first (FIFO)
            },
            take: 50 // Limit to 50 for performance
        })

        return NextResponse.json({
            success: true,
            students: pendingStudents,
            count: pendingStudents.length
        })
    } catch (error) {
        console.error('Pending Verification Fetch Error:', error)
        return NextResponse.json({ error: 'Failed to fetch pending verifications' }, { status: 500 })
    }
}
