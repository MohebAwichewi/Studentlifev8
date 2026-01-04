'use client'

import React, { useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import Link from 'next/link'

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '16px'
}

// Default center (Tunis)
const defaultCenter = {
  lat: 36.8065,
  lng: 10.1815
}

export default function GoogleDealMap({ pins }: { pins: any[] }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const [selectedPin, setSelectedPin] = useState<any | null>(null)

  if (!isLoaded) return (
    <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-bold text-slate-400">
      Loading Google Maps...
    </div>
  )

  return (
    <div className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
        }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => setSelectedPin(pin)}
          />
        ))}

        {selectedPin && (
          <InfoWindow
            position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
            onCloseClick={() => setSelectedPin(null)}
          >
            <div className="p-2 min-w-[200px] max-w-[250px]">
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded uppercase text-slate-500">{selectedPin.category}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">{selectedPin.businessName}</h3>
              <p className="text-xs text-slate-600 font-medium mb-3">{selectedPin.title}</p>
              
              <Link 
                href={`/business/${selectedPin.businessId}`}
                className="block w-full bg-[#5856D6] text-white text-center text-xs font-bold py-2 rounded-lg hover:bg-[#4542A8] transition"
              >
                View Deal
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}