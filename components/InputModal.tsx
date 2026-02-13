'use client'
import React, { useState } from 'react'

interface InputModalProps {
    isOpen: boolean
    title: string
    message: string
    placeholder?: string
    initialValue?: string
    onConfirm: (value: string) => void
    onCancel: () => void
    confirmText?: string
    isDanger?: boolean
}

export default function InputModal({ isOpen, title, message, placeholder, initialValue = '', onConfirm, onCancel, confirmText = "Submit", isDanger = false }: InputModalProps) {
    const [value, setValue] = useState(initialValue)

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-900'}`}>
                    <i className={`fa-solid ${isDanger ? 'fa-triangle-exclamation' : 'fa-pen'} text-xl`}></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 mb-6 font-medium leading-relaxed">{message}</p>

                <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 mb-6 resize-none h-32"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                />

                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Cancel</button>
                    <button
                        onClick={() => onConfirm(value)}
                        disabled={!value.trim()}
                        className={`flex-1 py-3.5 text-white rounded-xl font-bold shadow-lg transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-black hover:bg-slate-800 shadow-slate-200'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
