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
                    userType: 'USER'
                })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('SUCCESS')
                setTimeout(() => router.push('/user/login'), 3000)
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

    if (!token) return <div className="text-center text-red-500 font-bold p-10">Invalid or Missing Link</div>

    if (status === 'SUCCESS') {
        return (
            <div className="bg-green-50 text-green-800 p-8 rounded-2xl animate-in zoom-in text-center border border-green-100">
                <i className="fa-solid fa-lock text-4xl mb-4 text-green-600"></i>
                <h3 className="font-black text-2xl mb-2">All Set!</h3>
                <p className="text-sm font-medium">Your password has been updated.</p>
                <div className="mt-6 text-sm font-bold animate-pulse">Redirecting to login...</div>
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
                    placeholder="Create a strong password"
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-4 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            {status === 'ERROR' && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl text-center border border-red-100">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
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

export default function UserResetPassword() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-black selection:text-white">
            <div className="w-full max-w-md text-center relative border-0">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">New Password</h1>
                <p className="text-slate-500 font-medium mb-10">Choose a new password for your account.</p>
                <Suspense fallback={<div className="p-10"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-200"></i></div>}>
                    <ResetForm />
                </Suspense>
            </div>
        </div>
    )
}


