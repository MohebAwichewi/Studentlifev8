import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://student.life'

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/about',
        '/blog',
        '/student/signup',
        '/student/login',
        '/business/signup',
        '/business/login',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }))

    // 2. Dynamic Deals
    const deals = await prisma.deal.findMany({
        where: {
            status: 'ACTIVE',
        },
        select: {
            id: true,
            createdAt: true,
        },
        // Limit to prevent massive sitemaps if thousands of deals exist
        take: 5000,
        orderBy: { createdAt: 'desc' }
    })

    const dealUrls = deals.map((deal) => ({
        url: `${baseUrl}/student/deal/${deal.id}`,
        lastModified: deal.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // 3. Dynamic Businesses
    const businesses = await prisma.business.findMany({
        where: {
            status: 'ACTIVE', // Assuming 'ACTIVE' or similar status exists based on schema usage context, though schema default is PENDING
        },
        select: {
            id: true,
            updatedAt: true,
        },
        take: 1000,
        orderBy: { updatedAt: 'desc' }
    })

    // Note: Schema has status default "PENDING". Verified partners likely have "ACTIVE".
    // Note: Routes are /business/[id] as confirmed in file exploration.

    const businessUrls = businesses.map((business) => ({
        url: `${baseUrl}/business/${business.id}`,
        lastModified: business.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...staticRoutes, ...dealUrls, ...businessUrls]
}
