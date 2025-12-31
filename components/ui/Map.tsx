'use client'

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useState, useCallback } from 'react'

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '24px'
}

// Default center: Tunis (You can change this to your university coordinates)
const defaultCenter = {
  lat: 36.8065,
  lng: 10.1815
}

interface MapProps {
  deals: any[] // We will pass the deals here to show pins
}

export default function Map({ deals }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
  })

  const [map, setMap] = useState(null)

  const onLoad = useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: any) {
    setMap(null)
  }, [])

  if (!isLoaded) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl"></div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true, // Clean look (hides boring buttons)
        zoomControl: true,
        styles: [ // Dark Mode Map Style (Optional - looks cool)
            { featureType: "all", elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { featureType: "all", elementType: "labels.text.stroke", stylers: [{ lightness: -80 }] },
            { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }
        ]
      }}
    >
      {/* Show a Pin for every Deal */}
      {deals.map((deal) => (
        <Marker
          key={deal.id}
          position={{ 
            lat: 36.8065 + (Math.random() * 0.01), // MOCK LOCATION: In real app, businesses need coordinates
            lng: 10.1815 + (Math.random() * 0.01) 
          }} 
          title={deal.title}
        />
      ))}
    </GoogleMap>
  )
}