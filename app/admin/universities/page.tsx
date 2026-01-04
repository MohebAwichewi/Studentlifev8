'use client'

import React, { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import Link from 'next/link'

export default function AdminUniversities() {
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [isUniModalOpen, setIsUniModalOpen] = useState(false)
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false) 
  const [selectedUni, setSelectedUni] = useState<any>(null)

  // Forms
  const [uniForm, setUniForm] = useState({ name: '', region: 'Tunis', lat: '', lng: '' })
  const [campusForm, setCampusForm] = useState({ name: '', address: '', lat: '', lng: '' })
  const [noteContent, setNoteContent] = useState('')

  // Google Maps
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const uniInputRef = useRef<HTMLInputElement>(null)
  const campusInputRef = useRef<HTMLInputElement>(null)

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    const res = await fetch('/api/admin/universities/list')
    if (res.ok) setUniversities(await res.json())
    setLoading(false)
  }

  // --- 2. GOOGLE MAPS ---
  useEffect(() => {
    if (!scriptLoaded || !window.google) return

    if (isUniModalOpen && uniInputRef.current) {
        const ac = new window.google.maps.places.Autocomplete(uniInputRef.current, { componentRestrictions: { country: 'tn' } })
        ac.addListener('place_changed', () => {
            const place = ac.getPlace()
            if (place.geometry) {
                setUniForm(prev => ({ 
                    ...prev, 
                    name: place.name || prev.name,
                    lat: place.geometry?.location?.lat().toString() || '', 
                    lng: place.geometry?.location?.lng().toString() || '' 
                }))
            }
        })
    }

    if (isCampusModalOpen && campusInputRef.current) {
        const ac = new window.google.maps.places.Autocomplete(campusInputRef.current, { componentRestrictions: { country: 'tn' } })
        ac.addListener('place_changed', () => {
            const place = ac.getPlace()
            if (place.geometry) {
                setCampusForm(prev => ({ 
                    ...prev, 
                    address: place.formatted_address || '',
                    lat: place.geometry?.location?.lat().toString() || '', 
                    lng: place.geometry?.location?.lng().toString() || '' 
                }))
            }
        })
    }
  }, [scriptLoaded, isUniModalOpen, isCampusModalOpen])

  // --- 3. ACTIONS ---

  const handleAddUni = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/universities/create', {
        method: 'POST',
        body: JSON.stringify({
            name: uniForm.name,
            region: uniForm.region,
            latitude: uniForm.lat,
            longitude: uniForm.lng
        })
    })
    setIsUniModalOpen(false)
    setUniForm({ name: '', region: 'Tunis', lat: '', lng: '' })
    fetchUniversities()
  }

  const handleAddCampus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUni) return

    await fetch('/api/admin/universities/campus/create', {
        method: 'POST',
        body: JSON.stringify({
            universityId: selectedUni.id,
            name: campusForm.name,
            address: campusForm.address,
            latitude: campusForm.lat,
            longitude: campusForm.lng
        })
    })
    setIsCampusModalOpen(false)
    setCampusForm({ name: '', address: '', lat: '', lng: '' })
    fetchUniversities()
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUni || !noteContent.trim()) return

    await fetch('/api/admin/universities/notes/create', {
        method: 'POST',
        body: JSON.stringify({
            universityId: selectedUni.id,
            content: noteContent
        })
    })
    setNoteContent('')
    // Refresh local state to show note immediately
    const res = await fetch('/api/admin/universities/list')
    const newData = await res.json()
    setUniversities(newData)
    setSelectedUni(newData.find((u:any) => u.id === selectedUni.id))
  }

  // ✅ NEW: Update Campus Status Action
  const handleStatusChange = async (campusId: number, newStatus: string) => {
    // Optimistic UI update
    setUniversities(prev => prev.map(uni => ({
        ...uni,
        campuses: uni.campuses.map((c: any) => c.id === campusId ? { ...c, status: newStatus } : c)
    })))

    await fetch('/api/admin/universities/campus/update', {
        method: 'PUT',
        body: JSON.stringify({ campusId, status: newStatus })
    })
  }

  const openCampusModal = (uni: any) => { setSelectedUni(uni); setIsCampusModalOpen(true) }
  const openNotesModal = (uni: any) => { setSelectedUni(uni); setIsNotesModalOpen(true) } 

  // Helper for Status Colors
  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ACTIVE': return 'bg-green-100 text-green-700';
          case 'CLOSED': return 'bg-red-100 text-red-700';
          case 'MAINTENANCE': return 'bg-orange-100 text-orange-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans flex">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-10">
        <div className="p-8">
          <Link href="/admin" className="text-2xl font-black text-slate-900 tracking-tight">
            Student<span className="text-red-500">.LIFE</span>
          </Link>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold">
            <i className="fa-solid fa-table-columns w-5 text-center"></i> Overview
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 text-sm font-bold">
            <i className="fa-solid fa-school w-5 text-center"></i> Universities
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Universities</h2>
            <p className="text-slate-500 text-sm mt-1">Manage campuses and locations.</p>
          </div>
          <button onClick={() => setIsUniModalOpen(true)} className="bg-[#FF3B30] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-200">
             + Add University
          </button>
        </header>

        {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-1 gap-6">
                {universities.map(uni => (
                    <div key={uni.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{uni.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500 font-bold mt-1">
                                    <span>{uni.region}</span>
                                    <span>•</span>
                                    <span>{uni.campuses.length} Campuses</span>
                                    {uni.notes.length > 0 && (
                                        <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-xs">
                                            <i className="fa-solid fa-note-sticky mr-1"></i> {uni.notes.length} Notes
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openNotesModal(uni)} className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition">
                                    <i className="fa-regular fa-clipboard"></i>
                                </button>
                                <button onClick={() => openCampusModal(uni)} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                                    + Add Campus
                                </button>
                            </div>
                        </div>

                        {/* CAMPUS LIST */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-60 grayscale">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200"><i className="fa-solid fa-location-dot"></i></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">Main Location</div>
                                    <div className="text-xs text-slate-400 font-mono">{uni.latitude.toFixed(4)}, {uni.longitude.toFixed(4)}</div>
                                </div>
                            </div>
                            {uni.campuses.map((campus: any) => (
                                <div key={campus.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><i className="fa-solid fa-building-columns"></i></div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{campus.name}</div>
                                            <div className="text-xs text-slate-500">{campus.address}</div>
                                        </div>
                                    </div>
                                    
                                    {/* ✅ STATUS SELECTOR */}
                                    <select 
                                        value={campus.status} 
                                        onChange={(e) => handleStatusChange(campus.id, e.target.value)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded border-none outline-none cursor-pointer ${getStatusColor(campus.status)}`}
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="MAINTENANCE">MAINTENANCE</option>
                                        <option value="CLOSED">CLOSED</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* MODAL: ADD UNIVERSITY */}
      {isUniModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Add University</h3>
              <form onSubmit={handleAddUni} className="space-y-4">
                 <input ref={uniInputRef} placeholder="Search University..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" onChange={e => setUniForm({...uniForm, name: e.target.value})} />
                 <input placeholder="Region (e.g. Tunis)" value={uniForm.region} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" onChange={e => setUniForm({...uniForm, region: e.target.value})} />
                 <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Lat" value={uniForm.lat} readOnly className="p-3 bg-slate-100 rounded-xl text-slate-500" />
                    <input placeholder="Lng" value={uniForm.lng} readOnly className="p-3 bg-slate-100 rounded-xl text-slate-500" />
                 </div>
                 <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setIsUniModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Create</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: ADD CAMPUS */}
      {isCampusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Add Campus</h3>
              <p className="text-sm text-slate-500 mb-6">Adding to: <span className="font-bold">{selectedUni?.name}</span></p>
              
              <form onSubmit={handleAddCampus} className="space-y-4">
                 <input placeholder="Campus Name (e.g. Engineering Block)" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" onChange={e => setCampusForm({...campusForm, name: e.target.value})} />
                 <input ref={campusInputRef} placeholder="Search Location..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                 <input placeholder="Address" value={campusForm.address} readOnly className="w-full p-3 bg-slate-100 rounded-xl text-slate-500" />
                 <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Lat" value={campusForm.lat} readOnly className="p-3 bg-slate-100 rounded-xl text-slate-500" />
                    <input placeholder="Lng" value={campusForm.lng} readOnly className="p-3 bg-slate-100 rounded-xl text-slate-500" />
                 </div>
                 <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setIsCampusModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Add Campus</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: UNIVERSITY NOTES */}
      {isNotesModalOpen && selectedUni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Admin Notes</h3>
                    <p className="text-xs text-slate-500">Internal logs for {selectedUni.name}</p>
                  </div>
                  <button onClick={() => setIsNotesModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><i className="fa-solid fa-xmark"></i></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                 {selectedUni.notes?.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 text-sm">No notes yet. Add one below.</div>
                 ) : (
                    selectedUni.notes?.map((note: any) => (
                        <div key={note.id} className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900">
                            <div className="text-xs text-amber-900/50 font-bold mb-1">{new Date(note.createdAt).toLocaleString()}</div>
                            {note.content}
                        </div>
                    ))
                 )}
              </div>
              
              <form onSubmit={handleAddNote} className="pt-4 border-t border-slate-100">
                 <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Type a new note..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                    />
                    <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-200">
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  )
}