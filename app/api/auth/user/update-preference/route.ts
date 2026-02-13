import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { email, preferredCity } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Update user's preferred city
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                hometown: preferredCity || null
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Location preference saved',
            preferredCity: updatedUser.hometown
        })

    } catch (error) {
        console.error('Update preference error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
