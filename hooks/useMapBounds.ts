import { useState, useCallback, useEffect } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

export default function useMapBounds(items: any[]) {
    const [visibleItems, setVisibleItems] = useState<any[]>([])
    const [map, setMap] = useState<google.maps.Map | null>(null)

    // Load Google Maps API (shared logic)
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string
    })

    // Update visible items when map moves
    const onBoundsChanged = useCallback(() => {
        if (!map) return

        const bounds = map.getBounds()
        if (!bounds) return

        const visible = items.filter((item) => {
            const lat = item.latitude || item.lat
            const lng = item.longitude || item.lng
            if (!lat || !lng) return false
            return bounds.contains({ lat, lng })
        })

        setVisibleItems(visible)
    }, [map, items])

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance)
    }, [])

    const onUnmount = useCallback(() => {
        setMap(null)
    }, [])

    // Initial Sync
    useEffect(() => {
        if (map && items.length > 0) {
            onBoundsChanged()
        }
    }, [map, items, onBoundsChanged])

    return {
        isLoaded,
        onLoad,
        onUnmount,
        onBoundsChanged,
        visibleItems,
        map
    }
}
