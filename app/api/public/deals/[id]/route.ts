<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const dealId = parseInt(params.id)

        if (isNaN(dealId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid deal ID' },
                { status: 400 }
            )
        }

=======
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params; // ✅ Await params for Next.js 15+
        console.log("🚀 [API] GET /public/deals/[id] called with params:", params);

        const dealId = parseInt(params.id)
        console.log("Parsed Deal ID:", dealId);

        if (isNaN(dealId)) {
            console.error("❌ Invalid Deal ID:", params.id);
            return NextResponse.json({ error: "Invalid Deal ID" }, { status: 400 })
        }

        // 1. Fetch the Deal
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                business: {
                    select: {
<<<<<<< HEAD
                        id: true,
                        businessName: true,
                        category: true,
                        city: true,
                        latitude: true,
                        longitude: true,
                        logo: true,
                        coverImage: true,
                        googleMapEmbed: true,
                        locations: {
                            select: {
                                id: true,
                                lat: true,
                                lng: true,
                                address: true
                            }
                        }
=======
                        businessName: true,
                        logo: true,
                        coverImage: true,
                        latitude: true,
                        longitude: true,
                        address: true,
                        googleMapsUrl: true
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                    }
                }
            }
        })

        if (!deal) {
<<<<<<< HEAD
            return NextResponse.json(
                { success: false, error: 'Deal not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, deal })
    } catch (error) {
        console.error('Error fetching deal:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch deal' },
            { status: 500 }
        )
=======
            return NextResponse.json({ error: "Deal not found" }, { status: 404 })
        }

        // 2. Auth Check (for Redemption Status)
        let isRedeemed = false
        let isOwner = false // If we ever need to show owner-specific controls
        let userVoucher: any = null

        const authHeader = req.headers.get('authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any

                // If Student, check redemption and voucher
                if (decoded.role === 'student' && decoded.id) {
                    const redemption = await prisma.redemption.findFirst({
                        where: {
                            studentId: decoded.id,
                            dealId: dealId
                        }
                    })
                    if (redemption) {
                        isRedeemed = true
                    }

                    // ✅ Check for Voucher (e.g. Won from Spin)
                    userVoucher = await prisma.voucher.findFirst({
                        where: {
                            studentId: decoded.id,
                            dealId: dealId
                        },
                        orderBy: { createdAt: 'desc' } // Get latest
                    })
                }
            } catch (e) {
                // Token invalid or expired, treat as guest
                console.log("Token verification failed (treating as guest):", e)
            }
        }

        return NextResponse.json({
            success: true,
            deal: {
                ...deal,
                isRedeemed, // ✅ Critical new field
                userVoucher // ✅ Return Voucher Info (Expiry, Code)
            }
        })

    } catch (error) {
        console.error("Get Single Deal Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
    }
}
