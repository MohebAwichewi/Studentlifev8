import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ Using shared client (Best Practice)

export async function GET(req: Request) {
  try {
    // --- 1. Detect Real IP ---
    let ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    if (ip.includes(',')) ip = ip.split(',')[0] // Get first IP if multiple
    if (ip === '::1') ip = '127.0.0.1' // Handle local dev environment

    // --- 2. Resolve IP to City (GeoLocation) ---
    let userCity = 'Tunis' // Default fallback
    let isApproximate = true

    if (ip !== '127.0.0.1') {
        try {
            // Using ip-api.com (Free for non-commercial use)
            const geoRes = await fetch(`http://ip-api.com/json/${ip}`)
            const geoData = await geoRes.json()
            
            if (geoData.status === 'success' && geoData.city) {
                userCity = geoData.city
                isApproximate = false
            }
        } catch (e) {
            console.error("Geolocation failed, using default.")
        }
    }

    // --- 3. Find Deals in that City ---
    let deals = await prisma.deal.findMany({
      where: {
        status: 'ACTIVE', // ✅ Critical: Must be 'ACTIVE', not 'APPROVED'
        business: {
            city: { contains: userCity, mode: 'insensitive' } // "tunis" matches "Tunis"
        }
      },
      take: 6,
      orderBy: { priorityScore: 'desc' }, // Show boosted deals first
      include: {
        business: {
            select: { businessName: true, category: true, city: true, logo: true }
        }
      }
    })

    // --- 4. Fallback: If no deals in their city, show TOP deals from anywhere ---
    if (deals.length === 0) {
        deals = await prisma.deal.findMany({
            where: { status: 'ACTIVE' },
            take: 6,
            orderBy: { priorityScore: 'desc' },
            include: {
                business: { select: { businessName: true, category: true, city: true, logo: true } }
            }
        })
        userCity = "Tunisia" // Broaden scope for UI display
    }

    return NextResponse.json({ 
        success: true,
        location: userCity, 
        deals,
        isLocal: ip === '127.0.0.1' 
    })

  } catch (error) {
    console.error("Public Deals Error:", error)
    return NextResponse.json({ success: false, deals: [], error: "Server Error" }, { status: 500 })
  }
}