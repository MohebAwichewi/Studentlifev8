'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
}

const defaultCenter = {
  lat: 51.505, 
  lng: -0.09
}

// 1. ✅ CUSTOM PARTNER PIN (WIN Red)
const partnerIcon = {
  // SVG Path for a Map Marker shape
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#FF3B30", // Your Brand Red
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#FFFFFF", // White border to make it pop
  scale: 2, // Size of the pin
  anchor: { x: 12, y: 22 }, // Tip of the pin
}

// 2. USER LOCATION PIN (Blue Dot)
const userIcon = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#4285F4", // Google Blue
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "white",
  scale: 1.5,
  anchor: { x: 12, y: 22 }
}

interface MapProps {
  pins: any[]
  userLocation?: { lat: number; lng: number } | null
}

export default function GoogleDealMap({ pins, userLocation }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedPin, setSelectedPin] = useState<any>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  useEffect(() => {
    if (map) {
      if (userLocation) {
        map.panTo(userLocation)
        map.setZoom(14)
      } else if (pins.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        pins.forEach((pin) => {
            if (pin.lat && pin.lng) {
                bounds.extend({ lat: pin.lat, lng: pin.lng })
            }
        })
        map.fitBounds(bounds)
      } else {
        map.setCenter(defaultCenter)
        map.setZoom(13)
      }
    }
  }, [map, userLocation, pins])

  if (!isLoaded) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl"></div>

  // ✅ Fix for Type Safety regarding SVG Anchors
  const getIcon = (iconConfig: any) => {
      if (window.google) {
          return {
              ...iconConfig,
              anchor: new window.google.maps.Point(iconConfig.anchor.x, iconConfig.anchor.y)
          }
      }
      return iconConfig
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={getIcon(userIcon)}
          zIndex={999}
          title="You are here"
        />
      )}

      {/* Business Partner Pins */}
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={{ lat: pin.lat, lng: pin.lng }}
          onClick={() => setSelectedPin(pin)}
          icon={getIcon(partnerIcon)} // ✅ Apply Custom Red Pin Here
        />
      ))}

      {selectedPin && (
        <InfoWindow
          position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
          onCloseClick={() => setSelectedPin(null)}
        >
          <div className="p-2 min-w-[150px]">
            <h4 className="font-bold text-slate-900">{selectedPin.title}</h4>
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">{selectedPin.businessName}</p>
            {/* Added a tiny badge to the popup as well */}
            <span className="bg-[#FF3B30] text-white text-[10px] px-2 py-0.5 rounded font-bold mb-2 inline-block">Partner</span>
            
            <a href={`/user/deal/${selectedPin.id}`} className="block text-center bg-black text-white text-xs font-bold py-2 rounded-lg mt-1">
                View Deal
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
