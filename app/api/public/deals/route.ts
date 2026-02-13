import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { haversineDistance } from '@/lib/haversine'

export async function GET(req: Request) {
  try {
    // Parse URL to get query parameters
    const { searchParams } = new URL(req.url)
    const userLat = searchParams.get('lat')
    const userLng = searchParams.get('lng')
    const category = searchParams.get('category')
    const showSoldOut = searchParams.get('showSoldOut') === 'true'

    // Convert to numbers if provided
    const hasLocation = userLat && userLng
    const userLatNum = hasLocation ? parseFloat(userLat) : null
    const userLngNum = hasLocation ? parseFloat(userLng) : null

    // --- 1. Detect Real IP ---
    // --- 1. Detect Real IP or Manual City Override ---
    const { searchParams } = new URL(req.url)
    const manualCity = searchParams.get('city')

    let ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    if (ip.includes(',')) ip = ip.split(',')[0]
    if (ip === '::1') ip = '127.0.0.1'

    // --- 2. Resolve IP to City (GeoLocation) ---
    let userCity = manualCity || 'Tunis' // Default fallback or Manual Override
    let isApproximate = !manualCity // If manual, it's precise preference

    if (ip !== '127.0.0.1' && !manualCity) {
      try {
        // Using ip-api.com (Free for non-commercial use)
    // --- 2. Resolve IP to City (GeoLocation) ---
    let userCity = '' // No default city
    let isApproximate = true

    if (ip !== '127.0.0.1') {
      try {
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

    // --- 3. Build Query Filters ---
    const whereClause: any = {
      status: { in: ['APPROVED', 'ACTIVE'] },
      // FIX: Only filter by city if we DON'T have user coordinates. 
      // If we have coordinates, we'll sort by distance later, so we should get all deals within range (or all deals and let distance sort them).
      // For now, let's keep city filter ONLY if no location provided, or if radius is very large.
    }

    if (!userLat || !userLng) {
      whereClause.business = {
        city: { contains: userCity, mode: 'insensitive' }
      };
    }

    // Category Filter
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    // Sold Out Logic (If NOT showing sold out, filter them out)
    if (!showSoldOut) {
      whereClause.isSoldOut = false;
      whereClause.stock = { gt: 0 };
    }

    // ✅ FIX: Filter out Expired Deals
    // Deal must be active forever (null) OR expire in the future
    whereClause.AND = [
      {
        OR: [
          { expiry: null },
          { expiry: { gt: new Date() } }
        ]
      }
    ];

    const sort = searchParams.get('sort') // 'distance', 'newest', 'expiring'

    // ...

    // --- 4. Find Deals ---
    let orderBy: any = [
      { priorityScore: 'desc' },
      { createdAt: 'desc' }
    ];

    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'expiring') {
      orderBy = { expiry: 'asc' };
    }

    let deals = await prisma.deal.findMany({
      where: {
        isActive: true, // Only show active deals
        business: {
          city: {
            contains: userCity,
            mode: 'insensitive'
          }
        }
      },
      take: 50, // Show more deals on homepage
      orderBy: [
        { isFeatured: 'desc' }, // Featured deals first
        { isPriority: 'desc' }, // Priority deals next
        { createdAt: 'desc' }   // Then newest
      ],
      where: whereClause,
      take: 200,
      orderBy: orderBy,
      include: {
        business: {
          select: {
            businessName: true,
            category: true,
            city: true,
            latitude: true,
            longitude: true,
            logo: true,
            coverImage: true
          }
        }
      }
    })

    // --- 4. Fallback: If no deals in their city, show TOP deals from anywhere ---
    if (deals.length === 0) {
      deals = await prisma.deal.findMany({
        where: { isActive: true },
        take: 50,
        orderBy: [
          { isFeatured: 'desc' },
          { isPriority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          business: {
            select: { businessName: true, category: true, city: true, latitude: true, longitude: true, logo: true, coverImage: true }
          }
        }
      })
      userCity = "Tunisia" // Broaden scope for UI display
    }

    return NextResponse.json({
      success: true,
      location: userCity,
      deals,
      isLocal: ip === '127.0.0.1'
      console.log(`No deals found in ${userCity}, fetching global fallback.`);

      // Remove city filter, keep status/soldOut filters
      const fallbackWhere = { ...whereClause };
      delete fallbackWhere.business;

      deals = await prisma.deal.findMany({
        where: fallbackWhere,
        take: 20,
        orderBy: { priorityScore: 'desc' },
        include: {
          business: {
            select: {
              businessName: true,
              category: true,
              city: true,
              latitude: true,
              longitude: true,
              logo: true,
              coverImage: true
            }
          }
        }
      });
    }

    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 30 // Default 30km

    // --- 5. Calculate Distance and Add to Response ---
    const dealsWithDistance = deals.map((deal: any) => {
      let distance = null

      if (hasLocation && userLatNum && userLngNum && deal.business?.latitude && deal.business?.longitude) {
        distance = haversineDistance(
          userLatNum,
          userLngNum,
          deal.business.latitude,
          deal.business.longitude
        )
      }

      return {
        ...deal,
        distance // Add distance field to each deal
      }
    });

    // --- 6. Sort by Distance if Location Provided AND sort is distance (or default) ---
    // If user explicitly asked for 'newest' or 'expiring', DO NOT re-sort by distance.
    if (hasLocation && (!sort || sort === 'distance')) {
      dealsWithDistance.sort((a: any, b: any) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    }

    return NextResponse.json({
      success: true,
      location: userCity || 'Global',
      deals: dealsWithDistance,
      isLocal: ip === '127.0.0.1',
      sortedByDistance: hasLocation,
      fallback: deals.length > 0 && userCity && deals[0]?.business?.city !== userCity // Flag if fallback was used
    })

  } catch (error) {
    console.error("Public Deals Error:", error)
    return NextResponse.json({ success: false, deals: [], error: "Server Error" }, { status: 500 })
  }
}
