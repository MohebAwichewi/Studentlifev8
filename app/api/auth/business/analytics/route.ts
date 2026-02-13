import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subdays, format } from 'date-fns'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get('email')
        const businessId = searchParams.get('businessId')
        const range = searchParams.get('range') || '7d' // 7d, 30d, all

        if (!email || !businessId) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
        }

        // 1. Determine Date Range
        let startDate = new Date();
        if (range === '7d') startDate.setDate(startDate.getDate() - 7);
        if (range === '30d') startDate.setDate(startDate.getDate() - 30);
        if (range === 'all') startDate = new Date(0); // Beginning of time

        // 2. Fetch Deals for this Business
        const deals = await prisma.deal.findMany({
            where: { businessId: businessId },
            include: {
                _count: {
                    select: {
                        tickets: true,
                        redemptions: true
                    }
                }
            }
        })

        // 3. Aggregate KPI Totals (All Time or filtered? usually KPIs are total, but let's respect range for chart, maybe total for KPIs)
        // Let's do KPIs based on current view for more specific insights, or just generic totals?
        // User story: "ROI... decided if I should run this deal again." 
        // Let's allow KPIs to reflect the `range` too for consistency.

        // Fetch Tickets (Claims) within range
        const tickets = await prisma.ticket.findMany({
            where: {
                businessId: businessId,
                createdAt: { gte: startDate }
            },
            select: { createdAt: true }
        })

        // Fetch Redemptions within range
        const redemptions = await prisma.redemption.findMany({
            where: {
                deal: { businessId: businessId },
                createdAt: { gte: startDate }
            },
            select: { createdAt: true, deal: { select: { discount: true, title: true } } } // discount might be needed for revenue calc
        })

        // 4. Calculate KPI Cards
        const totalViews = deals.reduce((acc, deal) => acc + deal.views, 0) // Limit: View timestamp not stored, so this is always ALL TIME
        const totalClaims = tickets.length
        const totalRedemptions = redemptions.length

        let conversionRate = 0
        if (totalClaims > 0) {
            conversionRate = (totalRedemptions / totalClaims) * 100
        } else if (totalViews > 0) {
            // Fallback: Redemptions / Views if no claims logic? No, Claims is the funnel step.
            // Funnel: Views -> Claims -> Redemptions
        }

        // 5. Prepare Chart Data (Series)
        // We need a map of Date -> { claims: 0, redemptions: 0 }
        const chartDataMap = new Map<string, { date: string, claims: number, redemptions: number }>();

        // Initialize map with all dates in range
        const daysToGenerate = range === '7d' ? 7 : range === '30d' ? 30 : 14; // 'all' might be too big, cap at 30 or calculate dynamic
        // If 'all', find min date from deals?
        // For 'all', let's just group by what we have or default to last 30d if huge.
        // Let's stick to generating days for 7d/30d.

        if (range !== 'all') {
            for (let i = 0; i < daysToGenerate; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
                chartDataMap.set(dateStr, { date: format(d, 'MMM dd'), claims: 0, redemptions: 0 });
            }
        }

        // Populate Claims
        tickets.forEach(t => {
            const dateStr = t.createdAt.toISOString().split('T')[0];
            if (!chartDataMap.has(dateStr) && range === 'all') {
                chartDataMap.set(dateStr, { date: format(t.createdAt, 'MMM dd'), claims: 0, redemptions: 0 });
            }
            if (chartDataMap.has(dateStr)) {
                const entry = chartDataMap.get(dateStr)!
                entry.claims += 1
            }
        })

        // Populate Redemptions
        redemptions.forEach(r => {
            const dateStr = r.createdAt.toISOString().split('T')[0];
            if (!chartDataMap.has(dateStr) && range === 'all') {
                chartDataMap.set(dateStr, { date: format(r.createdAt, 'MMM dd'), claims: 0, redemptions: 0 });
            }
            if (chartDataMap.has(dateStr)) {
                const entry = chartDataMap.get(dateStr)!
                entry.redemptions += 1
            }
        })

        // Convert Map to Array & Sort
        const chartData = Array.from(chartDataMap.values()).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime() // This sort might be wrong because date is formatted 'MMM dd'. 
            // Better to sort by the Key (YYYY-MM-DD)
        ).reverse(); // Map iteration order is insertion order usually, but let's re-sort properly below.

        const sortedChartData = Array.from(chartDataMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0])) // Sort by YYYY-MM-DD key
            .map(entry => entry[1])


        const responseData = {
            range,
            kpi: {
                views: totalViews,
                claims: totalClaims,
                redemptions: totalRedemptions,
                conversionRate: conversionRate.toFixed(1)
            },
            chart: sortedChartData,
            recentActivity: redemptions.slice(0, 5).map(r => ({
                action: 'Redeemed',
                deal: r.deal.title,
                time: r.createdAt
            }))
        }

        return NextResponse.json(responseData)

    } catch (error) {
        console.error("Analytics Error:", error)
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
}
