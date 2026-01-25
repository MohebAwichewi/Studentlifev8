'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Scanner } from '@yudiel/react-qr-scanner' // ✅ NEW: Modern Scanner

export default function BusinessVerify() {
  // MOCK BUSINESS ID: In a real app, get this from the logged-in session
  const BUSINESS_ID = "clq2..." 

  const [activeTab, setActiveTab] = useState<'SCAN' | 'MANUAL'>('SCAN')
  const [manualInput, setManualInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [cameraOn, setCameraOn] = useState(true)

  // --- HANDLER: Process the ID (Scanned or Typed) ---
  const handleVerification = async (studentId: string) => {
    setLoading(true)
    setError('')
    setCameraOn(false) // Pause camera while processing

    try {
      const res = await fetch('/api/business/verify-redemption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            studentId: studentId,
            businessId: BUSINESS_ID 
        })
      })

      const data = await res.json()

      if (data.success) {
        setScanResult(data.student) // Show Success Screen
      } else {
        setError(data.error || "Verification Failed")
        // Note: We don't automatically restart camera on error to let user read the message.
        // They can switch tabs or click a retry button if you add one.
      }
    } catch (err) {
      setError("Network Error")
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLER: QR Scan Event (Updated for @yudiel/react-qr-scanner) ---
  const handleScan = (results: any[]) => {
    if (results && results.length > 0 && cameraOn) {
      try {
        const text = results[0].rawValue // ✅ Get raw value from new library
        if (!text) return

        let parsedId = text
        try {
            // Attempt to parse JSON if your QR codes are JSON objects
           const json = JSON.parse(text)
           if (json.id) parsedId = json.id
        } catch(e) {
           // It's just a raw string ID, continue
        }

        handleVerification(parsedId)
      } catch (err) {
        console.error("Scan Parse Error")
      }
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setManualInput('')
    setError('')
    setCameraOn(true)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
         
         {/* HEADER */}
         <div className="p-6 text-center border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-900">Merchant Scanner</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verify Student ID</p>
         </div>

         {/* --- SUCCESS SCREEN --- */}
         {scanResult ? (
            <div className="p-8 text-center bg-green-50 animate-in zoom-in duration-200">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-xl">
                  <i className="fa-solid fa-check text-4xl text-white"></i>
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-1">{scanResult.fullName}</h2>
               <p className="text-sm font-bold text-slate-500 uppercase mb-6">{scanResult.university}</p>
               
               <div className="bg-white border-2 border-green-100 p-4 rounded-xl mb-6">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wide">Status</div>
                  <div className="text-lg font-black text-green-700">VERIFIED & LOGGED</div>
                  <div className="text-[10px] text-slate-400 mt-1">Interaction recorded in database</div>
               </div>

               <button onClick={resetScanner} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition">
                 Scan Next Student
               </button>
            </div>
         ) : (
           
            /* --- SCANNING INTERFACE --- */
            <div>
               {/* TABS */}
               <div className="flex p-2 gap-2 bg-slate-50 mx-6 mt-6 rounded-xl">
                  <button onClick={() => { setActiveTab('SCAN'); setCameraOn(true); setError(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'SCAN' ? 'bg-white shadow text-[#5856D6]' : 'text-slate-400 hover:text-slate-600'}`}>
                     <i className="fa-solid fa-qrcode mr-2"></i> Camera
                  </button>
                  <button onClick={() => { setActiveTab('MANUAL'); setCameraOn(false); setError(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'MANUAL' ? 'bg-white shadow text-[#5856D6]' : 'text-slate-400 hover:text-slate-600'}`}>
                     <i className="fa-solid fa-keyboard mr-2"></i> Manual
                  </button>
               </div>

               <div className="p-6 min-h-[300px] flex flex-col justify-center">
                  
                  {activeTab === 'SCAN' && (
                     <div className="relative rounded-2xl overflow-hidden bg-black aspect-square shadow-inner">
                        {cameraOn ? (
                           <div className="w-full h-full relative">
                             {/* ✅ NEW SCANNER COMPONENT */}
                             <Scanner 
                                onScan={handleScan}
                                allowMultiple={true}
                                scanDelay={2000} // Prevent accidental double scans
                                components={{
                                  audio: false, // Turn off beep sound if preferred
                                  finder: false // We draw our own custom frame below
                                }}
                                styles={{
                                    container: { width: '100%', height: '100%' },
                                    video: { objectFit: 'cover' }
                                }}
                             />
                             
                             {/* Overlay Frame (Custom Design) */}
                             <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center pointer-events-none">
                                <div className="w-40 h-40 border-4 border-white/80 rounded-xl relative">
                                   <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#5856D6] -mt-1 -ml-1"></div>
                                   <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#5856D6] -mt-1 -mr-1"></div>
                                   <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#5856D6] -mb-1 -ml-1"></div>
                                   <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#5856D6] -mb-1 -mr-1"></div>
                                </div>
                             </div>
                             <p className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-xs font-bold pointer-events-none">Align QR Code within frame</p>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center h-full text-white/50">
                              <i className="fa-solid fa-camera-slash text-3xl mb-2"></i>
                              <p className="text-xs">Camera Paused</p>
                              <button onClick={() => setCameraOn(true)} className="mt-4 text-xs bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition text-white">
                                Resume Camera
                              </button>
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'MANUAL' && (
                     <div className="flex flex-col gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Student ID</label>
                           <input 
                             type="text" 
                             className="w-full bg-slate-100 p-4 rounded-xl font-bold text-slate-900 border-2 border-transparent focus:border-[#5856D6] outline-none transition"
                             placeholder="Enter ID manually..."
                             value={manualInput}
                             onChange={(e) => setManualInput(e.target.value)}
                           />
                        </div>
                        <button 
                           onClick={() => handleVerification(manualInput)}
                           disabled={!manualInput || loading}
                           className="w-full bg-[#5856D6] text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
                        >
                           {loading ? 'Verifying...' : 'Verify ID'}
                        </button>
                     </div>
                  )}

                  {error && (
                     <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
                        <i className="fa-solid fa-triangle-exclamation"></i> {error}
                     </div>
                  )}

               </div>
            </div>
         )}
         
         <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
             <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600">Cancel & Return Home</Link>
         </div>

      </div>
    </div>
  )
}