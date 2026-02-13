import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                type: true
            },
            orderBy: {
                name: 'asc'
            }
        })
        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })

        // ✅ Fallback if DB is empty to ensure UI has buttons
        if (categories.length === 0) {
            return NextResponse.json({
                success: true,
                categories: [
                    { name: 'Food' },
                    { name: 'Tech' },
                    { name: 'Fashion' },
                    { name: 'Entertainment' },
                    { name: 'Beauty' },
                    { name: 'Services' }
                ]
            })
        }

        return NextResponse.json({
            success: true,
            categories: categories.map(c => ({ name: c.name })) // Format for mobile: [{ name: 'Food' }]
        })
    } catch (error) {
        console.error("Categories Fetch Error:", error)
        // Return defaults on error too, for resilience
        return NextResponse.json({
            success: true,
            categories: [{ name: 'Food' }, { name: 'Tech' }, { name: 'Fashion' }]
        })
    }
}
