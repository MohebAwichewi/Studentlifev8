import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { type, id, newUrl } = await req.json()

    if (!newUrl) return NextResponse.json({ error: "URL required" }, { status: 400 })

    if (type === 'deal') {
        await prisma.deal.update({
            where: { id: parseInt(id) },
            data: { image: newUrl }
        })
    } else if (type === 'business_logo') {
        await prisma.business.update({
            where: { id: id },
            data: { logo: newUrl }
        })
    } else if (type === 'business_cover') {
        await prisma.business.update({
            where: { id: id },
            data: { coverImage: newUrl }
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Fix failed" }, { status: 500 })
  }
}