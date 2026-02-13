'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- 1. CLAIM DEAL (Create Ticket) ---
export async function claimDeal(dealId: number, userId: string) {
  try {
    // 1. Check if user already has an ACTIVE (unused) ticket for this deal
    // Prevent hoarding multiple active tickets for the same deal
    const existingActiveTicket = await prisma.ticket.findFirst({
      where: {
        userId: userId,
        dealId: dealId,
        isUsed: false
      }
    })

    if (existingActiveTicket) {
      return { success: true, ticket: existingActiveTicket, message: "You already have an active ticket" }
    }

    // 2. Check if deal is "Single Use" and already redeemed (Optional based on business logic)
    // For now, if a user has redeemed it, we might still allow another claim UNLESS explicitly restricted.
    // However, the prompt asks to HIDE it after use. Filtering will happen on frontend/fetch.

    // 3. Generate Unique Code with Collision Handling
    let ticketCode = ''
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 5) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase() // 6 chars
      const userSuffix = userId.substring(0, 2).toUpperCase() // 2 chars from User ID for entropy
      ticketCode = `WIN-${userSuffix}-${randomCode}` // Format: WIN-US-XXXXXX

      const existing = await prisma.ticket.findUnique({ where: { code: ticketCode } })
      if (!existing) isUnique = true
      attempts++
    }

    if (!isUnique) throw new Error("Failed to generate unique code after retries")

    // 4. Get Deal info to link business
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { business: true }
    })

    if (!deal) return { success: false, error: "Deal not found" }

    // 5. Create Ticket
    const ticket = await prisma.ticket.create({
      data: {
        code: ticketCode,
        qrData: ticketCode,
        userId: userId,
        dealId: dealId,
        businessId: deal.businessId,
        isUsed: false
      }
    })

    revalidatePath('/user/wallet')
    return { success: true, ticket }

  } catch (error) {
    console.error("Claim Error:", error)
    return { success: false, error: "Failed to claim deal" }
  }
}

// --- 2. VALIDATE TICKET (Business Scanner) ---
export async function validateTicket(code: string, businessId: string) {
  try {
    const cleanCode = code.trim().toUpperCase()

    // 1. Find Ticket
    const ticket = await prisma.ticket.findUnique({
      where: { code: cleanCode },
      include: { deal: true, user: true }
    })

    if (!ticket) {
      return { success: false, error: "Ticket Code Not Found" }
    }

    // 2. Check if belongs to this business
    if (ticket.businessId !== businessId) {
      return { success: false, error: "Ticket belongs to a different shop." }
    }

    // 3. Check if already used
    if (ticket.isUsed) {
      return { success: false, error: `Used on ${ticket.usedAt?.toLocaleDateString()} at ${ticket.usedAt?.toLocaleTimeString()}` }
    }

    // 4. Mark as Used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    })

    // 5. Create Redemption Record for Analytics
    await prisma.redemption.create({
      data: {
        userId: ticket.userId,
        dealId: ticket.dealId
      }
    })

    revalidatePath('/business/dashboard')

    return {
      success: true,
      message: "Ticket Verified Successfully!",
      dealTitle: ticket.deal.title,
      userName: ticket.user.fullName
    }

  } catch (error) {
    console.error("Validation Error:", error)
    return { success: false, error: "System error verifying ticket" }
  }
}