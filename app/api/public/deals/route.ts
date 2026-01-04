import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // 1. Detect Real IP (Works on Vercel & Localhost)
    let ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    if (ip.includes(',')) ip = ip.split(',')[0] // Get first IP if multiple
    if (ip === '::1') ip = '127.0.0.1' // Handle local dev

    // 2. Resolve IP to City (Using Free Real-Time API)
    let userCity = 'Tunis' // Default fallback
    let isApproximate = true

    if (ip !== '127.0.0.1') {
        try {
            // Using ip-api.com (Free for non-commercial use, perfect for MVP)
            const geoRes = await fetch(`http://ip-api.com/json/${ip}`)
            const geoData = await geoRes.json()
            
            if (geoData.status === 'success' && geoData.city) {
                userCity = geoData.city
                isApproximate = false // We found their real city
            }
        } catch (e) {
            console.error("Geolocation failed, using default.")
        }
    }

    // 3. Find Deals in that City
    let deals = await prisma.deal.findMany({
      where: {
        status: 'APPROVED', // Only show approved deals
        business: {
            city: { contains: userCity, mode: 'insensitive' } // "tunis" matches "Tunis"
        }
      },
      take: 6,
      orderBy: { priorityScore: 'desc' }, // Show boosted deals first
      include: {
        business: {
            select: { businessName: true, category: true, city: true }
        }
      }
    })

    // 4. Fallback: If no deals in their city, show ANY top deals
    if (deals.length === 0) {
        deals = await prisma.deal.findMany({
            where: { status: 'APPROVED' },
            take: 6,
            orderBy: { priorityScore: 'desc' },
            include: {
                business: { select: { businessName: true, category: true, city: true } }
            }
        })
        userCity = "Tunisia" // Broaden scope for UI
    }

    return NextResponse.json({ 
        location: userCity, 
        deals,
        isLocal: ip === '127.0.0.1' 
    })

  } catch (error) {
    console.error("Public Deals Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}