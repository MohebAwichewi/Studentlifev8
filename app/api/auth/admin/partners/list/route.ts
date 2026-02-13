import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        // 1. Pagination & Sorting
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const order = searchParams.get('order') || 'desc'

        // 2. Filters
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''
        const city = searchParams.get('city') || ''
        const category = searchParams.get('category') || ''

        // Construct Where Clause
        const where: Prisma.BusinessWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { businessName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { city: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                status ? { status: { equals: status, mode: 'insensitive' } } : {}, // Case insensitive status check
                city && city !== 'All' ? { city: { equals: city, mode: 'insensitive' } } : {},
                category && category !== 'All' ? { category: { equals: category, mode: 'insensitive' } } : {}
            ]
        }

        // 3. Transaction for Count & Data
        const [total, businesses] = await prisma.$transaction([
            prisma.business.count({ where }),
            prisma.business.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                select: {
                    id: true,
                    businessName: true,
                    email: true,
                    category: true,
                    city: true,
                    status: true,
                    logo: true,
                    plan: true,
                    createdAt: true,
                    _count: {
                        select: {
                            deals: { where: { isActive: true } } // Count only active deals
                        }
                    }
                    // Revenue calculation would happen here if we had a relation to payments
                }
            })
        ])

        // 4. Transform Data
        const mappedBusinesses = businesses.map(b => ({
            ...b,
            stats: {
                activeDeals: b._count.deals,
                revenue: 0 // Placeholder as per plan
            }
        }))

        return NextResponse.json({
            success: true,
            businesses: mappedBusinesses,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Partner List Error:", error)
        return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
    }
}
