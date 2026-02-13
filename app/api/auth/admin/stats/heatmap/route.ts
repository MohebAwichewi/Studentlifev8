import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Group users by hometown and count
        const cityStats = await prisma.user.groupBy({
            by: ['hometown'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10 // Top 10 cities
        })

        // Get total users for percentage calculation
        const totalUsers = await prisma.user.count()

        // Format heatmap data
        const heatmap = cityStats.map((stat, index) => {
            const percentage = totalUsers > 0
                ? ((stat._count.id / totalUsers) * 100).toFixed(1)
                : '0'

            // Determine intensity level
            let intensity: 'HIGH' | 'MEDIUM' | 'LOW'
            if (index === 0) intensity = 'HIGH'
            else if (index <= 2) intensity = 'MEDIUM'
            else intensity = 'LOW'

            return {
                city: stat.hometown || 'Unknown',
                count: stat._count.id,
                percentage: parseFloat(percentage),
                intensity
            }
        })

        return NextResponse.json(heatmap)

    } catch (error) {
        console.error('Heatmap Error:', error)
        return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 })
    }
}
