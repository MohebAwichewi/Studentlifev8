import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const feed: any[] = []

        // 1. Get recent redemptions (last 10)
        const redemptions = await prisma.redemption.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                deal: { select: { title: true } },
                user: { select: { fullName: true } }
            }
        })

        redemptions.forEach(r => {
            feed.push({
                id: `red-${r.id}`,
                type: 'REDEMPTION',
                message: `Deal "${r.deal.title}" redeemed by ${r.user.fullName}`,
                time: formatTime(r.createdAt),
                icon: 'ticket',
                color: 'bg-green-100 text-green-600',
                timestamp: r.createdAt
            })
        })

        // 2. Get recent user signups (last 5)
        const users = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, fullName: true, hometown: true, createdAt: true }
        })

        users.forEach(u => {
            feed.push({
                id: `user-${u.id}`,
                type: 'USER_SIGNUP',
                message: `New User "${u.fullName}" joined from ${u.hometown || 'Unknown'}`,
                time: formatTime(u.createdAt),
                icon: 'user-plus',
                color: 'bg-blue-100 text-blue-600',
                timestamp: u.createdAt
            })
        })

        // 3. Get recent business signups (last 5)
        const businesses = await prisma.business.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, businessName: true, status: true, createdAt: true }
        })

        businesses.forEach(b => {
            feed.push({
                id: `biz-${b.id}`,
                type: 'PARTNER_SIGNUP',
                message: `Business "${b.businessName}" ${b.status === 'PENDING' ? 'applied' : 'joined'}`,
                time: formatTime(b.createdAt),
                icon: 'briefcase',
                color: 'bg-amber-100 text-amber-600',
                timestamp: b.createdAt
            })
        })

        // Sort by timestamp (most recent first) and limit to 20
        const sortedFeed = feed
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20)
            .map(({ timestamp, ...item }) => item) // Remove timestamp from response

        return NextResponse.json(sortedFeed)

    } catch (error) {
        console.error('Live Feed Error:', error)
        return NextResponse.json({ error: 'Failed to fetch live feed' }, { status: 500 })
    }
}

// Helper function to format time
function formatTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
}
