const CACHE_NAME = 'win-tunisia-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/user/home',
    '/user/wallet',
    '/offline.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...')
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets')
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...')
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip chrome extensions
    if (request.url.startsWith('chrome-extension://')) {
        return
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Return cached response if found
            if (cachedResponse) {
                return cachedResponse
            }

            // Otherwise fetch from network
            return fetch(request)
                .then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response
                    }

                    // Clone the response
                    const responseToCache = response.clone()

                    // Cache API responses and images
                    if (
                        request.url.includes('/api/') ||
                        request.url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)
                    ) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache)
                        })
                    }

                    return response
                })
                .catch(() => {
                    // If both cache and network fail, show offline page
                    if (request.destination === 'document') {
                        return caches.match(OFFLINE_URL)
                    }
                })
        })
    )
})

// Background sync for ticket claims (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tickets') {
        event.waitUntil(syncTickets())
    }
})

async function syncTickets() {
    console.log('[Service Worker] Syncing tickets...')
    // Future: Sync pending ticket claims when back online
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {}
    const title = data.title || 'WIN Tunisia'
    const options = {
        body: data.body || 'New deal available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.url || '/user/home'
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        clients.openWindow(event.notification.data || '/user/home')
    )
})
