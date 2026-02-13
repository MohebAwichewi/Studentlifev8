import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { name, nameAr, region, latitude, longitude, isActive } = await req.json()
        const cityId = parseInt(params.id)

        const city = await prisma.city.update({
            where: { id: cityId },
            data: {
                name,
                nameAr,
                region,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                isActive
            }
        })

        return NextResponse.json(city)
    } catch (error) {
        console.error('Failed to update city:', error)
        return NextResponse.json({ error: 'Failed to update city' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const cityId = parseInt(params.id)

        await prisma.city.delete({
            where: { id: cityId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete city:', error)
        return NextResponse.json({ error: 'Failed to delete city' }, { status: 500 })
    }
}
