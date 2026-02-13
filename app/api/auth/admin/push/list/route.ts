import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'ALL'

    // Filter Logic
    const where: Prisma.PushRequestWhereInput = status !== 'ALL' ? { status } : {}

    // Fetch Requests
    const requests = await prisma.pushRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            category: true,
            logo: true
          }
        },
        deal: {
          select: {
            id: true,
            title: true,
            discount: true
          }
        }
      }
    })

    // Spam Detection & Transformation
    // Note: For a real rigorous spam check, we'd query count of approved requests in last 7 days per business.
    // Doing a lightweight version here or assuming we might fetch distinct counts separately if load is high.

    // Let's do a quick separate aggregation for "Recent Sends" for distinct businesses in this list
    const uniqueBusinessIds = [...new Set(requests.map(r => r.businessId).filter(Boolean))] as string[]

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSends = await prisma.pushRequest.groupBy({
      by: ['businessId'],
      where: {
        businessId: { in: uniqueBusinessIds },
        status: 'SENT',
        sentAt: { gte: sevenDaysAgo }
      },
      _count: { id: true }
    })

    const recentSendsMap = new Map(recentSends.map(r => [r.businessId, r._count.id]))

    const mappedRequests = requests.map(req => ({
      id: req.id,
      business: {
        id: req.business?.id,
        name: req.business?.businessName,
        logo: req.business?.logo,
        category: req.business?.category,
        recentSends: recentSendsMap.get(req.businessId!) || 0 // Spam Metric
      },
      content: {
        title: req.title,
        message: req.message,
        dealTitle: req.deal?.title,
        dealDiscount: req.deal?.discount
      },
      targeting: {
        radius: req.targetRadius,
        filters: req.filters
      },
      status: req.status,
      rejectionReason: req.rejectionReason,
      createdAt: req.createdAt,
      sentAt: req.sentAt
    }))

    return NextResponse.json(mappedRequests)

  } catch (error) {
    console.error("Push List Error:", error)
    return NextResponse.json({ error: "Failed to fetch push requests" }, { status: 500 })
  }
}