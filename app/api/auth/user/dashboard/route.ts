import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // 1. Find Student
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 2. Find University & City Context (For Location Relevance)
    const universityData = await prisma.university.findFirst({
      where: { name: { contains: user.university, mode: 'insensitive' } }
    })

    // Default to 'Tunis' if we can't find their uni region
    const userCity = universityData?.region || "Tunis"

    // Campus Coords for the map fallback
    const campusCoords = universityData
      ? { lat: universityData.latitude, lng: universityData.longitude, name: universityData.name }
      : { lat: 36.8065, lng: 10.1815, name: "Tunis (Default)" }

    // 3. 🧠 GET USER PREFERENCES (What have they saved before?)
    const savedRecords = await prisma.savedDeal.findMany({
      where: { userId: user.id },
      include: { deal: true } // Include deal details to see categories
    })

    const savedDealIds = savedRecords.map(r => r.dealId)

    // Calculate preferred categories based on save history
    // Set ensures unique values (e.g., {'Food', 'Tech'})
    const preferredCategories = new Set(savedRecords.map(r => r.deal.category))

    // 4. GET REDEMPTIONS (To hide used deals)
    const redemptions = await prisma.redemption.findMany({
      where: { userId: user.id },
      select: { dealId: true }
    })
    const redeemedDealIds = redemptions.map(r => r.dealId)

    // 5. FETCH ALL ACTIVE DEALS (Raw Data)
    const rawDeals = await prisma.deal.findMany({
      where: { isActive: true },
      take: 50, // Show more deals
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            category: true,
            city: true,
            // logo: true, // ❌ REMOVED: Causing 500 Payload Error
            latitude: true,
            longitude: true
          }
        }
      }
    })

    // 6. 🚀 THE RELEVANCE ENGINE (Real Scoring Logic)
    // We map over every deal and assign a 'relevanceScore'
    const scoredDeals = rawDeals.map((deal) => {
      let score = 0 // Base score

      // RULE A: Featured deals (+30 Points)
      if (deal.isFeatured) {
        score += 30
      }

      // RULE B: Priority deals (+20 Points)
      if (deal.isPriority) {
        score += 20
      }

      // RULE C: Interest Match (+15 Points)
      // If the user has saved deals in this category before, boost it.
      if (preferredCategories.has(deal.category)) {
        score += 15
      }

      // RULE D: Location Match (+10 Points)
      // If the business is in the same city as the student's university, boost it.
      const businessCity = deal.business.city || ""
      if (businessCity.toLowerCase().includes(userCity.toLowerCase())) {
        score += 10
      }

      // RULE E: Newness (+5 Points)
      // Boost deals created in the last 7 days
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      if (new Date(deal.createdAt) > oneWeekAgo) {
        score += 5
      }

      return { ...deal, relevanceScore: score }
    })

    // 7. SORT BY SCORE (Highest Relevance First)
    scoredDeals.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // 8. Return the personalized list
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        isVerified: user.isVerified,
        dob: user.dob,
        hometown: user.hometown
      },
      campusCoords,
      deals: scoredDeals, // Now sorted by relevance!
      savedDealIds,
      redeemedDealIds // ✅ Return Redeemed IDs
    })

  } catch (error) {
    console.error("Dashboard Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}
