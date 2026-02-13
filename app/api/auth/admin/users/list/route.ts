import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
<<<<<<< HEAD
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        // 1. Pagination & Sorting
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

        // 2. Filters
        const search = searchParams.get('search') || ''
        const city = searchParams.get('city')
        const status = searchParams.get('status') // 'active', 'banned', 'all'

        // Build Where Clause
        const where: Prisma.UserWhereInput = {}

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (city && city !== 'All') {
            where.city = city
        }

        if (status) {
            if (status === 'banned') where.isBanned = true
            if (status === 'active') where.isBanned = false
        }

        // 3. Execute Queries (Total Count + Data)
        const [total, users] = await prisma.$transaction([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    city: true,
                    isVerified: true,
                    isBanned: true,
                    createdAt: true,
                    _count: {
                        select: {
                            tickets: true, // Total Claims
                            redemptions: true // Total Redeemed
                        }
                    }
                }
            })
        ])

        return NextResponse.json({
            success: true,
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

=======

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
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    } catch (error) {
        console.error("Users List Error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
