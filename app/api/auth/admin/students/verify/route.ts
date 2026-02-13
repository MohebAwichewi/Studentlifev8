import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationSuccess, sendVerificationRejection } from '@/lib/email'

export async function POST(req: Request) {
    try {
        const { studentId, action, reason } = await req.json()

        if (!studentId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        if (action === 'APPROVE') {
            // Approve the student
            await prisma.student.update({
                where: { id: studentId },
                data: { isVerified: true }
            })

            // Send Success Email
            await sendVerificationSuccess(student.email, student.fullName)

            return NextResponse.json({
                success: true,
                message: 'Student verified successfully',
                action: 'APPROVED'
            })
        }

        if (action === 'REJECT') {
            // Reject: Clear idCardUrl so they don't appear in pending anymore
            // User must re-upload ID to be verified again
            await prisma.student.update({
                where: { id: studentId },
                data: {
                    isVerified: false,
                    idCardUrl: null
                }
            })

            // Send Rejection Email
            await sendVerificationRejection(student.email, student.fullName, reason || "ID document issue")

            return NextResponse.json({
                success: true,
                message: 'Student rejected. Email sent.',
                action: 'REJECTED',
                reason
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Student Verification Error:', error)
        return NextResponse.json({ error: 'Failed to process verification' }, { status: 500 })
    }
}
