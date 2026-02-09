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

  const [currentPosition, setCurrentPosition] = useState(defaultCenter)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          console.error("Error retrieving location")
        }
      )
    }
  }, [])

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
      center={currentPosition}
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
            lat: deal.lat || 36.8065,
            lng: deal.lng || 10.1815
          }}
          title={deal.title}
          icon={{
            url: deal.logo || "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", // Default shop icon if no logo
            scaledSize: new window.google.maps.Size(50, 50), // Size of the logo
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(25, 25), // Center the icon
            // Note: Google Maps Markers don't easily support rounded borders via 'icon' prop directly without SVG masking.
            // Using the raw image for now. For perfect circles, we'd need an OverlayView or predefined circular images.
          }}
        />
      ))}

      {/* 📍 USER LOCATION MARKER (Blue Dot) */}
      <Marker
        position={currentPosition}
        icon={{
          path: window.google?.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        }}
        title="You are here"
      />
    </GoogleMap>
  )
}