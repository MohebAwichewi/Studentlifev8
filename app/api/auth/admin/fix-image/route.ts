import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { type, id, newUrl } = await req.json()

    if (!newUrl) return NextResponse.json({ error: "URL required" }, { status: 400 })

    if (type === 'deal') {
        await prisma.deal.update({
            // ⚠️ FIX: Removed parseInt() to allow String IDs
            where: { id: id },
            data: { image: newUrl } // Ensure your schema has an 'image' field, or change to 'imageUrl'
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
    console.error("Fix Image Error:", error)
    return NextResponse.json({ error: "Fix failed" }, { status: 500 })
  }
}