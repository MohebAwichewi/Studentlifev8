import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { email } = await req.json()
        const ticketId = params.id

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Find ticket by unique code or ID
        const ticket = await prisma.voucher.findFirst({
            where: {
                OR: [
                    { id: ticketId },
                    { uniqueCode: ticketId }
                ],
                userId: user.id
            },
            include: {
                deal: {
                    include: {
                        business: true
                    }
                }
            }
        })

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        // Return ticket details
        return NextResponse.json({
            success: true,
            ticket: {
                id: ticket.id,
                qrData: ticket.uniqueCode,
                code: ticket.uniqueCode,
                status: ticket.isRedeemed ? 'used' : 'active',
                claimedAt: ticket.createdAt,
                redeemedAt: ticket.redeemedAt,
                deal: {
                    id: ticket.deal.id,
                    title: ticket.deal.title,
                    description: ticket.deal.description,
                    discount: ticket.deal.discountValue || ticket.deal.title,
                    image: ticket.deal.image,
                    expiry: ticket.deal.expiry,
                    category: ticket.deal.category
                },
                business: {
                    id: ticket.deal.business.id,
                    name: ticket.deal.business.businessName,
                    logo: ticket.deal.business.logo,
                    address: ticket.deal.business.address,
                    phone: ticket.deal.business.phone,
                    latitude: ticket.deal.business.latitude,
                    longitude: ticket.deal.business.longitude
                }
            }
        })

    } catch (error) {
        console.error('Get ticket error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
