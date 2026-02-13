import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId, businessId, ticketCode, action } = await req.json() // action: 'VERIFY' | 'REDEEM'

    if (!businessId) {
      return NextResponse.json({ success: false, error: "Missing Business ID" }, { status: 400 })
    }

    // Default to VERIFY if not specified (backward compatibility)
    const currentAction = action || 'VERIFY';

    // ✅ FLOW 1: TICKET CODE REDEMPTION (Priority)
    if (ticketCode) {
      const voucher = await prisma.voucher.findFirst({
        where: { code: ticketCode },
        include: { user: true, deal: true }
      })

      if (!voucher) {
        return NextResponse.json({ success: false, error: "Invalid Ticket Code" }, { status: 404 })
      }

      // Check if belong to this business
      if (voucher.deal.businessId !== businessId) {
        return NextResponse.json({ success: false, error: "Ticket not valid for this store." }, { status: 403 })
      }

      // Check if Already Used
      if (voucher.isUsed) {
        return NextResponse.json({ success: false, error: "Ticket has already been used." }, { status: 409 }) // 409 Conflict
      }

      // Calculate Final Price
      const originalPrice = voucher.deal.originalPrice || 0;
      const discountString = voucher.deal.discount; // e.g., "20%" or "5 TND"
      let finalPrice = 0;

      if (discountString.includes('%')) {
        const percentage = parseFloat(discountString.replace('%', ''));
        finalPrice = originalPrice - (originalPrice * (percentage / 100));
      } else {
        // Assume fixed amount off or fixed price? Usually "5 TND Off" or just "5 TND"
        // If the string is just "X TND", is that the new price or the discount?
        // Let's assume standard format: "20%" or "5 TND" (meaning 5 TND OFF? or 5 TND Price?)
        // If it's "5 TND", usually means "Price is 5 TND" in many deals context, OR "5 TND Off".
        // Let's assume it represents the *Discount Value* if it says "Off", but if just "5 TND"..
        // For safety, let's just return the raw strings and let Frontend display "Amount to Collect" if logic is complex.
        // BUT User Story says "Calculate Final Price".
        // Let's try to parse:
        const val = parseFloat(discountString);
        if (!isNaN(val)) {
          // If fixed value, usually it's the new price if it's a "Deal"?
          // Or is it a discount amount?
          // Let's assume if originalPrice > 0, we treat 'discount' as reduction if < original, or fixed price?
          // Simplest: Final Price = Original - Discount (if fixed)
          // Let's just return `originalPrice` and `discount` to frontend.
          finalPrice = Math.max(0, originalPrice - val); // Fallback logic
        }
      }

      // ✅ ACTION: VERIFY (Just Check)
      if (currentAction === 'VERIFY') {
        return NextResponse.json({
          success: true,
          user: {
            fullName: voucher.user.fullName,
            university: voucher.user.university,
            image: null
          },
          deal: {
            title: voucher.deal.title,
            discount: voucher.deal.discount,
            originalPrice: voucher.deal.originalPrice,
            finalPrice: finalPrice // Frontend can override this logic if needed
          },
          ticketCode: voucher.code,
          message: "Ticket is Valid!"
        })
      }

      // ✅ ACTION: REDEEM (Burn It)
      if (currentAction === 'REDEEM') {
        await prisma.$transaction([
          prisma.voucher.update({
            where: { id: voucher.id },
            data: { isUsed: true }
          }),
          prisma.redemption.create({
            data: {
              dealId: voucher.dealId,
              userId: voucher.userId,
              redeemedAmount: finalPrice // ✅ NEW: Save the calculated price
            }
          }),
          prisma.business.update({
            where: { id: businessId },
            data: { viewCount: { increment: 1 } }
          })
        ])

        return NextResponse.json({
          success: true,
          message: "Redemption Successful!"
        })
      }
    }

    // ✅ FLOW 2: USER ID CHECK (Identity Only - No Price Logic needed usually)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json({ success: false, error: "Invalid User ID" }, { status: 404 })
      }

      if (!user.isVerified) {
        return NextResponse.json({ success: false, error: "User is NOT Verified." }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        user: {
          fullName: user.fullName,
          university: user.university,
          image: null
        },
        message: "User Identity Verified (No Ticket)"
      })
    }

    return NextResponse.json({ success: false, error: "Missing Ticket Code or User ID" }, { status: 400 })

  } catch (error) {
    console.error("Redemption Error:", error)
    return NextResponse.json({ success: false, error: "Server Error processing request" }, { status: 500 })
  }
}
