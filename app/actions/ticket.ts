'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- 1. CREATE TICKET (Claim Deal) ---
export async function createTicket(dealId: number, identifier: string) {
    try {
        let userId = identifier

        // Resolve Email to ID if needed
        if (identifier.includes('@')) {
            const user = await prisma.user.findUnique({ where: { email: identifier } })
            if (!user) return { success: false, error: "User not found" }
            userId = user.id
        }
        // 1. Get Deal Logic & Validation
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                tickets: {
                    select: { userId: true } // Minimize data fetch
                }
            }
        })

        if (!deal) {
            return { success: false, error: "Deal not found" }
        }

        // 2. CHECK: Is Deal Active?
        if (!deal.isActive) {
            return { success: false, error: "This deal is no longer active." }
        }

        // 3. CHECK: Expiry
        if (deal.expiry && new Date(deal.expiry) < new Date()) {
            return { success: false, error: "This deal has expired." }
        }

        // 4. CHECK: Validation - Inventory (Total Claims)
        // If totalInventory is NULL, it means infinite (or not set)
        if (deal.totalInventory !== null && deal.tickets.length >= deal.totalInventory) {
            return { success: false, error: "Sold Out! All tickets have been claimed." }
        }

        // 5. CHECK: Validation - User Limit
        const userTickets = deal.tickets.filter(t => t.userId === userId)
        // Use default of 1 if not specified
        const limit = deal.maxClaimsPerUser ?? 1

        // NOTE: We generally block if they have ANY active ticket, but if mult-use is allowed, we might check total count
        // The requirement says: "Checks User Limit (user.tickets for this deal < deal.userLimit)"
        if (userTickets.length >= limit) {
            return { success: false, error: `You have reached the claim limit (${limit}) for this deal.` }
        }

        // 6. CHECK: Prevent Double Active Claims (Optional but good UX)
        // Even if limit is > 1, maybe force them to use one before getting another?
        // For now, let's stick to the hard limit count.

        // 7. Generate Data
        let ticketCode = ''
        let isUnique = false
        let attempts = 0

        while (!isUnique && attempts < 5) {
            const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase() // 4 chars
            const userSuffix = userId.substring(0, 2).toUpperCase() // 2 chars
            ticketCode = `WN-${userSuffix}${randomCode}` // New Format: #WN-XX

            const existing = await prisma.ticket.findUnique({ where: { code: ticketCode } })
            if (!existing) isUnique = true
            attempts++
        }

        if (!isUnique) throw new Error("Failed to generate unique code")

        // 8. Create Record
        const ticket = await prisma.ticket.create({
            data: {
                code: ticketCode,
                qrData: ticketCode, // In real app, maybe encrypt this
                userId: userId,
                dealId: dealId,
                businessId: deal.businessId,
                isUsed: false
            }
        })

        // 9. Revalidate (Update UI)
        revalidatePath('/user/wallet')
        revalidatePath(`/user/deal/${dealId}`)

        return { success: true, ticket }

    } catch (error) {
        console.error("Create Ticket Error:", error)
        return { success: false, error: "System error creating ticket." }
    }
}

// --- 2. GET MY TICKETS ---
export async function getMyTickets(userId: string) {
    try {
        const tickets = await prisma.ticket.findMany({
            where: { userId },
            include: {
                deal: {
                    include: { business: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, tickets }
    } catch (error) {
        return { success: false, error: "Failed to fetch tickets" }
    }
}
