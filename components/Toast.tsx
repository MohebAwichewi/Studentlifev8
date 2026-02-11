'use client'
import React, { useEffect } from 'react'

export default function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-top-5 duration-300 ${type === 'success' ? 'bg-[#0F392B] text-white' : 'bg-red-500 text-white'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
                <i className={`fa-solid ${type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div>
                <h4 className="font-bold text-sm">{type === 'success' ? 'Success' : 'Error'}</h4>
                <p className="text-xs text-white/90 font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-white/50 hover:text-white transition"><i className="fa-solid fa-xmark"></i></button>
        </div>
    )
}
