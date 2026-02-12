import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/student/dashboard/',
                '/business/dashboard/',
                '/profile/',
                '/settings/'
            ],
        },
        sitemap: 'https://student.life/sitemap.xml',
    }
}
