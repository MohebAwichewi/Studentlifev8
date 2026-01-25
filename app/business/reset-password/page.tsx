'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [errorMsg, setErrorMsg] = useState('Invalid or expired token.')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: password,
                    userType: 'BUSINESS'
                })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('SUCCESS')
                setTimeout(() => router.push('/business/login'), 3000)
            } else {
                setStatus('ERROR')
                setErrorMsg(data.error || "Failed to reset password.")
            }
        } catch (error) {
            setStatus('ERROR')
            setErrorMsg("Network error.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) return <div className="text-center text-red-500 font-bold p-10">Invalid Link</div>

    if (status === 'SUCCESS') {
        return (
            <div className="bg-green-50 text-green-700 p-8 rounded-2xl animate-in zoom-in text-center">
                <i className="fa-solid fa-circle-check text-5xl mb-4"></i>
                <h3 className="font-bold text-2xl mb-2">Password Updated!</h3>
                <p className="text-sm font-medium">Redirecting to login...</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left w-full">
            <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 ml-1">New Password</label>
                <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            {status === 'ERROR' && (
                <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-lg text-center">
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Update Password"}
            </button>
        </form>
    )
}

export default function BusinessResetPassword() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md text-center relative border border-slate-100 flex flex-col items-center">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Set New Password</h1>
                <p className="text-slate-500 font-medium text-sm mb-8">Secure your business account.</p>
                <Suspense fallback={<div className="p-4"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-slate-400"></i></div>}>
                    <ResetForm />
                </Suspense>
            </div>
        </div>
    )
}
