'use client'

import React, { useState, useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api'
import Image from 'next/image'
import Link from 'next/link'

const containerStyle = {
    width: '100%',
    height: '100%'
}

const defaultCenter = {
    lat: 36.8065, // Tunis
    lng: 10.1815
}

// Map Styles (Dark/Clean Mode)
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
    ]
}

interface InteractiveMapProps {
    items: any[]
    selectedId?: string | null
    onMarkerClick: (id: string) => void
    onLoad: (map: google.maps.Map) => void
    onUnmount: (map: google.maps.Map) => void
    onBoundsChanged: () => void
}

export default function InteractiveMap({ items, selectedId, onMarkerClick, onLoad, onUnmount, onBoundsChanged }: InteractiveMapProps) {
    const [activeMarker, setActiveMarker] = useState<any>(null)

    // Memoize Locations
    const locations = useMemo(() => {
        return items.map(item => ({
            lat: item.latitude || item.lat,
            lng: item.longitude || item.lng,
            ...item
        })).filter(loc => loc.lat && loc.lng)
    }, [items])

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onBoundsChanged={onBoundsChanged} // Updates list on drag/zoom
            options={mapOptions}
        >
            <MarkerClusterer>
                {(clusterer) => (
                    <>
                        {locations.map((location) => (
                            <Marker
                                key={location.id}
                                position={{ lat: location.lat, lng: location.lng }}
                                clusterer={clusterer}
                                onClick={() => {
                                    onMarkerClick(location.id)
                                    setActiveMarker(location)
                                }}
                                icon={{
                                    url: location.logo || 'https://via.placeholder.com/50', // Fallback
                                    scaledSize: new window.google.maps.Size(50, 50),
                                    origin: new window.google.maps.Point(0, 0),
                                    anchor: new window.google.maps.Point(25, 25),
                                    className: 'rounded-full border-2 border-white shadow-lg object-cover' // Note: className doesn't work on standard Markers, need OverlayView for CSS styling or custom SVG.
                                    // For MVP, updated approach below using SVG with image pattern or standard icon.
                                    // actually standard icon url works best for reliability.
                                }}
                            // Note: Google Maps Marker 'icon' property with URL is simple but hard to style circular with border perfectly. 
                            // Better approach for "Logos" is typically OverlayView, but Marker is faster.
                            // We will stick to basic Icon for V1 stability.
                            />
                        ))}
                    </>
                )}
            </MarkerClusterer>

            {/* InfoWindow for Selected Pin */}
            {activeMarker && (
                <InfoWindow
                    position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
                    onCloseClick={() => setActiveMarker(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                >
                    <div className="p-2 min-w-[160px] text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 overflow-hidden mb-2 relative border border-slate-200">
                            <Image src={activeMarker.logo || '/icons/shop.png'} alt="Logo" fill className="object-cover" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">{activeMarker.businessName}</h3>
                        <p className="text-xs text-slate-500 mb-2">{activeMarker.category}</p>
                        <Link href={`/business/${activeMarker.id}`} className="block w-full py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-[#E60023]">
                            View Profile
                        </Link>
                    </div>
                </InfoWindow>
            )}

        </GoogleMap>
    )
}
