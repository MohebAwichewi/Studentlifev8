import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Student.LIFE',
        short_name: 'Student.LIFE',
        description: 'The ultimate student companion app for discounts and offers.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF3B30',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            // Ideally you would add 192x192 and 512x512 png icons here
        ],
    }
}
