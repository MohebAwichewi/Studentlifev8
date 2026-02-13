'use client'

import { useEffect, useState } from 'react'

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration)
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Show prompt after 30 seconds if not already installed
            setTimeout(() => {
                if (!window.matchMedia('(display-mode: standalone)').matches) {
                    setShowPrompt(true)
                }
            }, 30000) // 30 seconds
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA is already installed')
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        console.log(`User response to install prompt: ${outcome}`)

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        // Don't show again for 7 days
        localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString())
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
            <div className="bg-gradient-to-br from-[#FF3B30] to-[#d63026] rounded-2xl shadow-2xl p-6 text-white">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                >
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>

                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-black text-[#FF3B30]">W</span>
                    </div>
                    <div>
                        <h3 className="font-black text-lg mb-1">Install WIN App</h3>
                        <p className="text-white/90 text-sm">
                            Get instant access to your wallet and tickets, even offline!
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-check-circle text-white/80"></i>
                        <span>Works offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-check-circle text-white/80"></i>
                        <span>Faster loading</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-check-circle text-white/80"></i>
                        <span>Home screen access</span>
                    </div>
                </div>

                <button
                    onClick={handleInstallClick}
                    className="w-full bg-white text-[#FF3B30] py-3 rounded-xl font-bold hover:bg-white/90 transition"
                >
                    <i className="fa-solid fa-download mr-2"></i>
                    Install Now
                </button>
            </div>
        </div>
    )
}
