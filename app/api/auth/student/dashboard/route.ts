import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // 1. Find Student
    const student = await prisma.student.findUnique({
      where: { email: email }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // 2. Find University & City Context (For Location Relevance)
    const universityData = await prisma.university.findFirst({
      where: { name: { contains: student.university, mode: 'insensitive' } }
    })

    // Default to 'Tunis' if we can't find their uni region
    const studentCity = universityData?.region || "Tunis"
    
    // Campus Coords for the map fallback
    const campusCoords = universityData 
      ? { lat: universityData.latitude, lng: universityData.longitude, name: universityData.name }
      : { lat: 36.8065, lng: 10.1815, name: "Tunis (Default)" }

    // 3. 🧠 GET USER PREFERENCES (What have they saved before?)
    const savedRecords = await prisma.savedDeal.findMany({
      where: { studentId: student.id },
      include: { deal: true } // Include deal details to see categories
    })

    const savedDealIds = savedRecords.map(r => r.dealId)

    // Calculate preferred categories based on save history
    // Set ensures unique values (e.g., {'Food', 'Tech'})
    const preferredCategories = new Set(savedRecords.map(r => r.deal.category))

    // 4. FETCH ALL ACTIVE DEALS (Raw Data)
    const rawDeals = await prisma.deal.findMany({
      where: { status: 'APPROVED' },
      include: { business: true }
    })

    // 5. 🚀 THE RELEVANCE ENGINE (Real Scoring Logic)
    // We map over every deal and assign a 'relevanceScore'
    const scoredDeals = rawDeals.map((deal) => {
        let score = deal.priorityScore || 0 // Start with Admin Priority (0-100)

        // RULE A: Interest Match (+20 Points)
        // If the user has saved deals in this category before, boost it.
        if (preferredCategories.has(deal.category)) {
            score += 20
        }

        // RULE B: Location Match (+15 Points)
        // If the business is in the same city as the student's university, boost it.
        if (deal.business.city && deal.business.city.toLowerCase().includes(studentCity.toLowerCase())) {
            score += 15
        }

        // RULE C: Newness (+5 Points)
        // Boost deals created in the last 7 days
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        if (new Date(deal.createdAt) > oneWeekAgo) {
            score += 5
        }

        return { ...deal, relevanceScore: score }
    })

    // 6. SORT BY SCORE (Highest Relevance First)
    scoredDeals.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // 7. Return the personalized list
    return NextResponse.json({ 
      student: { 
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        university: student.university,
        isVerified: student.isVerified,
        dob: student.dob,
        hometown: student.hometown
      },
      campusCoords,
      deals: scoredDeals, // Now sorted by relevance!
      savedDealIds
    })

  } catch (error) {
    console.error("Dashboard Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}