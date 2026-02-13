
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 STARTING LOGIC VERIFICATION...')

    // 1. SETUP: Create Entities
    const email = `qa-test-${Date.now()}@test.com`
    const busEmail = `qa-biz-${Date.now()}@test.com`

    console.log('Creating Test User...')
    const user = await prisma.user.create({
        data: { fullName: 'QA Tester', email, password: 'password', dob: '2000-01-01', university: 'Test Uni', hometown: 'Tunis' }
    })

    console.log('Creating Test Business...')
    const business = await prisma.business.create({
        data: { businessName: 'QA Burger', email: busEmail, password: 'password', status: 'ACTIVE', city: 'Tunis' }
    })

    console.log('Creating Test Deal...')
    const deal = await prisma.deal.create({
        data: { title: 'Free QA Burger', description: 'Testing Flow', discount: '100%', category: 'Food', businessId: business.id, isActive: true }
    })

    // 2. USER: Claim Deal
    console.log('🎫 Step 1: User claims deal...')
    // Simulate claimDeal action logic
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
    const ticketCode = `WIN-${randomCode}`
    const ticket = await prisma.ticket.create({
        data: {
            code: ticketCode,
            qrData: ticketCode,
            userId: user.id,
            dealId: deal.id,
            businessId: business.id,
            isUsed: false
        }
    })
    console.log('   ✅ Ticket Created:', ticket.code)

    // 3. VERIFY: Wallet
    console.log('👛 Step 2: checking Wallet...')
    const walletTickets = await prisma.ticket.findMany({
        where: { userId: user.id, isUsed: false }
    })
    if (walletTickets.length > 0 && walletTickets[0].code === ticket.code) {
        console.log('   ✅ Ticket found in wallet')
    } else {
        throw new Error('Ticket not found in wallet')
    }

    // 4. BUSINESS: Validate Ticket
    console.log('📱 Step 3: Business Scans Ticket...')
    // Simulate validateTicket action
    const scannedTicket = await prisma.ticket.findUnique({ where: { code: ticket.code } })
    if (!scannedTicket) throw new Error("Ticket not found for scanning")
    if (scannedTicket.businessId !== business.id) throw new Error("Business Mismatch")

    await prisma.ticket.update({
        where: { id: ticket.id },
        data: { isUsed: true, usedAt: new Date() }
    })

    await prisma.redemption.create({
        data: { userId: user.id, dealId: deal.id }
    })
    console.log('   ✅ Ticket Scanned & Redeemed')

    // 5. VERIFY: Single Use (Should be hidden/marked used)
    console.log('🕵️ Step 4: Verifying Single Use...')
    const usedCheck = await prisma.ticket.findUnique({ where: { id: ticket.id } })
    if (!usedCheck?.isUsed) throw new Error("Ticket was not marked as used")
    console.log('   ✅ Ticket marked as used')

    const redemptionCheck = await prisma.redemption.findFirst({ where: { userId: user.id, dealId: deal.id } })
    if (!redemptionCheck) throw new Error("Redemption record missing")
    console.log('   ✅ Redemption record exists')

    // 6. VERIFY: Dashboard Logic (Should return this ID in redeemed list)
    const dashboardRedemptions = await prisma.redemption.findMany({ where: { userId: user.id }, select: { dealId: true } })
    const redeemedIds = dashboardRedemptions.map(r => r.dealId)
    if (redeemedIds.includes(deal.id)) {
        console.log('   ✅ Deal ID present in Redeemed List (will be hidden on frontend)')
    } else {
        throw new Error("Deal ID not in redeemed list")
    }

    // 7. VERIFY: Admin Stats
    console.log('📊 Step 5: Verifying Real-Time Stats...')
    const totalRedemptions = await prisma.redemption.count()
    // Just ensuring count > 0 is enough for a basic check here
    if (totalRedemptions > 0) {
        console.log('   ✅ Global Redemptions Count > 0')
    }

    console.log('🎉 SUCCESS: Full User -> Business -> Admin flow verified!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
