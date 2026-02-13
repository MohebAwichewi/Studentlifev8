import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { section, content } = body

        if (!section || !content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Upsert: Update if exists, Create if not
        const config = await prisma.homepageConfig.upsert({
            where: { section },
            update: { content: JSON.stringify(content) },
            create: {
                section,
                content: JSON.stringify(content)
            }
        })

        return NextResponse.json({ success: true, config })
    } catch (error) {
        console.error("Homepage Config Update Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const configs = await prisma.homepageConfig.findMany()

        // Parse JSON content for easier frontend usage
        const parsedConfigs = configs.reduce((acc: any, curr) => {
            try {
                acc[curr.section] = JSON.parse(curr.content)
            } catch (e) {
                acc[curr.section] = curr.content
            }
            return acc
        }, {})

        return NextResponse.json(parsedConfigs)
    } catch (error) {
        console.error("Homepage Config Fetch Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}
