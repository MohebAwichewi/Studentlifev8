'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationResultProps {
    result: {
        success: boolean;
        user?: { fullName: string; university: string };
        deal?: {
            title: string;
            discount: string;
            originalPrice?: number;
            finalPrice?: number
        };
        error?: string;
        ticketCode?: string;
        message?: string;
    };
    onReset: () => void;
    onRedeemConfirm?: (ticketCode: string) => Promise<void>;
}

export default function ValidationResult({ result, onReset, onRedeemConfirm }: ValidationResultProps) {
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [isRedeemed, setIsRedeemed] = useState(false);

    const handleConfirm = async () => {
        if (!onRedeemConfirm || !result.ticketCode) return;
        setIsRedeeming(true);
        try {
            await onRedeemConfirm(result.ticketCode);
            setIsRedeemed(true);
            // Play success sound again?
        } catch (e) {
            console.error(e);
        } finally {
            setIsRedeeming(false);
        }
    };

    // --- SUCCESS STATE (VALID TICKET) ---
    if (result.success && result.deal) {
        if (isRedeemed) {
            // STEP 3: FINAL REDEMPTION SUCCESS
            return (
                <div className="bg-[#22c55e] p-8 rounded-3xl text-center shadow-2xl shadow-green-900/50 animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                        <i className="fa-solid fa-check-double text-[#22c55e]"></i>
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">TRANSACTION COMPLETE!</h2>
                    <p className="text-green-100 font-bold mt-4 text-lg">Thank you!</p>
                    <div className="mt-8">
                        <button onClick={onReset} className="w-full bg-white text-[#22c55e] font-black py-4 rounded-xl shadow-lg hover:bg-green-50 transition">
                            Scan Next Customer
                        </button>
                    </div>
                </div>
            );
        }

        // STEP 2: VERIFIED - SHOW DETAILS
        return (
            <div className="bg-[#22c55e] p-8 rounded-3xl text-center shadow-2xl shadow-green-900/50 animate-in zoom-in-95">
                {/* 1. Header */}
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-md">
                    <i className="fa-solid fa-check text-[#22c55e]"></i>
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">VALID TICKET!</h2>

                {/* 2. Customer Info */}
                <div className="mt-2 text-green-100">
                    <p className="font-bold text-lg">{result.user?.fullName}</p>
                    <p className="text-xs uppercase opacity-80">{result.user?.university}</p>
                </div>

                {/* 3. The Math / Deal Context */}
                <div className="mt-6 bg-white/20 p-5 rounded-3xl backdrop-blur-sm border border-white/30">
                    <p className="text-xs text-white/90 font-bold uppercase tracking-widest mb-1">Applying Offer</p>
                    <p className="text-xl font-black text-white leading-tight mb-4">{result.deal.discount} {result.deal.title}</p>

                    {/* Amount to Collect */}
                    {result.deal.originalPrice && result.deal.originalPrice > 0 ? (
                        <div className="bg-white rounded-2xl p-4 shadow-lg transform scale-105">
                            <p className="text-[#22c55e] text-xs font-bold uppercase tracking-widest">Amount to Collect</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-slate-900">{result.deal.finalPrice?.toFixed(2) || '0.00'}</span>
                                <span className="text-sm font-bold text-slate-400">TND</span>
                            </div>
                            {result.deal.originalPrice > 0 && (
                                <p className="text-slate-400 text-xs line-through mt-1">{result.deal.originalPrice} TND</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <p className="text-[#22c55e] text-xs font-bold uppercase tracking-widest">Check Discount</p>
                            <p className="text-2xl font-black text-slate-900">{result.deal.discount}</p>
                        </div>
                    )}
                </div>

                {/* 4. Actions */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleConfirm}
                        disabled={isRedeeming}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
                    >
                        {isRedeeming ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-fire"></i> Mark as Redeemed</>}
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full bg-transparent text-white/80 font-bold py-3 hover:text-white transition text-sm"
                    >
                        Cancel / Scan Next
                    </button>
                </div>
            </div>
        );
    }

    // --- SUCCESS STATE (IDENTITY ONLY) ---
    if (result.success && !result.deal) {
        return (
            <div className="bg-blue-500 p-8 rounded-3xl text-center shadow-2xl shadow-blue-900/50 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
                    <i className="fa-solid fa-user-check text-blue-500"></i>
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase">Identity Verified</h2>
                <div className="mt-4 text-white">
                    <p className="font-bold text-2xl">{result.user?.fullName}</p>
                    <p className="opacity-80">{result.user?.university}</p>
                </div>
                <div className="mt-8">
                    <button onClick={onReset} className="w-full bg-white text-blue-500 font-black py-4 rounded-xl shadow-lg hover:bg-blue-50 transition">
                        Scan Next
                    </button>
                </div>
            </div>
        );
    }

    // --- ERROR STATE ---
    return (
        <div className="bg-[#FF3B30] p-8 rounded-3xl text-center shadow-2xl shadow-red-900/50 animate-shake">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                <i className="fa-solid fa-xmark text-[#FF3B30]"></i>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">INVALID CODE</h2>

            <div className="mt-6 bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-sm">
                <p className="text-white font-bold text-xl">{result.error}</p>
                <p className="text-white/80 text-sm mt-1">Please check the code and try again.</p>
            </div>

            <div className="mt-8">
                <button onClick={onReset} className="w-full bg-white text-[#FF3B30] font-black py-4 rounded-xl shadow-lg hover:bg-red-50 transition flex items-center justify-center gap-2">
                    <i className="fa-solid fa-camera-rotate"></i> Try Again
                </button>
            </div>
        </div>
    );
}
