import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // In a real app, get ID from Session/Cookie. 
    // For MVP, we'll assume we pass email via header or grab the first matching business for simplicity 
    // OR (Better for MVP) rely on the frontend sending the email in a custom header.
    // Let's assume the frontend sends 'x-business-email' header for now (we'll update frontend to match).
    
    // HOWEVER, since we can't easily change headers in standard fetch without logic, 
    // let's stick to the POST method for security/simplicity in MVP like we did for stats.
    
    // actually, let's switch this to POST so we can pass the email in the body securely.
    return NextResponse.json({ error: "Use POST to fetch sensitive data" }, { status: 405 })
    
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

// ✅ REAL IMPLEMENTATION
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({
      where: { email },
      include: { 
        deals: { orderBy: { createdAt: 'desc' } } 
      }
    })

    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ deals: business.deals })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}