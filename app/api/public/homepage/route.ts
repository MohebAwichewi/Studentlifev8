import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const configs = await prisma.homepageConfig.findMany()

        // Parse JSON content
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
        console.error("Public Homepage Fetch Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}
