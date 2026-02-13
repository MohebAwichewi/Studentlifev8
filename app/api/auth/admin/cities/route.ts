import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(cities)
    } catch (error) {
        console.error('Failed to fetch cities:', error)
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { name, nameAr, region, latitude, longitude } = await req.json()

        if (!name) {
            return NextResponse.json({ error: 'City name is required' }, { status: 400 })
        }

        const city = await prisma.city.create({
            data: {
                name,
                nameAr,
                region,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                isActive: true
            }
        })

        return NextResponse.json(city)
    } catch (error: any) {
        console.error('Failed to create city:', error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'City already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create city' }, { status: 500 })
    }
}
