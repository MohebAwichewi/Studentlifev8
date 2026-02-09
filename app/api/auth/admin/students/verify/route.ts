import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { studentId, action, reason } = await req.json()

        if (!studentId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { university: true }
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

            // TODO: Send push notification
            // await sendPushNotification(student.pushToken, {
            //   title: "Welcome to Student Life!",
            //   body: "Your ID has been verified. Start exploring exclusive deals!"
            // })

            return NextResponse.json({
                success: true,
                message: 'Student verified successfully',
                action: 'APPROVED'
            })
        }

        if (action === 'REJECT') {
            // Reject: Keep isVerified as false, they can try verification again
            await prisma.student.update({
                where: { id: studentId },
                data: {
                    isVerified: false
                }
            })

            // TODO: Send email with rejection reason
            // await sendEmail(student.email, {
            //   subject: "ID Verification - Action Required",
            //   body: `Your ID verification was rejected. Reason: ${reason || 'Please upload a clear photo of your student ID'}. Please re-upload your ID in the app.`
            // })

            return NextResponse.json({
                success: true,
                message: 'Student rejected. They can re-upload their ID.',
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
