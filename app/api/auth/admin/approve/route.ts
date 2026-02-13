import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id, type, action, reason } = await req.json()

    // IF Approved -> ACTIVE. IF Rejected -> REJECTED.
    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'

    console.log(`ADMIN ACTION: ${action} ${type} ${id}`)

    if (type === 'business') {
      await prisma.business.update({
        where: { id },
        data: {
          status: newStatus,
          rejectionReason: reason || null
        }
      })

      // TODO: Send email notification to business if rejected
      if (action === 'REJECT') {
        console.log(`Business ${id} rejected. Reason: ${reason}`)
        // await sendEmail(business.email, { subject: "Application Rejected", body: reason })
      }
    }
    else if (type === 'deal') {
      const deal = await prisma.deal.update({
        where: { id: Number(id) },
        data: {
          status: newStatus,
          rejectionReason: reason || null
        },
        include: {
          business: {
            select: {
              id: true,
              businessName: true,
              email: true
            }
          }
        }
      })

      // Send notification to business if deal is rejected
      if (action === 'REJECT' && deal.business) {
        try {
          // Create a push notification record for the business
          await prisma.pushRequest.create({
            data: {
              title: "Deal Rejected",
              message: `Your deal "${deal.title}" was rejected. Reason: ${reason || 'Please review and resubmit.'}`,
              status: 'SENT',
              businessId: deal.business.id,
              universityId: null,
              radius: null
            }
          })
          console.log(`Rejection notification sent to business ${deal.business.businessName}`)
        } catch (notifError) {
          console.error('Failed to send rejection notification:', notifError)
        }
      }

      // Send success notification if approved
      if (action === 'APPROVE' && deal.business) {
        try {
          await prisma.pushRequest.create({
            data: {
              title: "Deal Approved! 🎉",
              message: `Your deal "${deal.title}" is now live and visible to students!`,
              status: 'SENT',
              businessId: deal.business.id,
              universityId: null,
              radius: null
            }
          })
          console.log(`Approval notification sent to business ${deal.business.businessName}`)
        } catch (notifError) {
          console.error('Failed to send approval notification:', notifError)
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Approval Error:", error)
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}