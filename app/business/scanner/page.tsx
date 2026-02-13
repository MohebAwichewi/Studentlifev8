'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import ValidationResult from '@/components/business/ValidationResult';

// --- TYPES ---
interface VerificationResult {
  success: boolean;
  user?: {
    fullName: string;
    university: string;
  };
  deal?: {
    title: string;
    discount: string;
    originalPrice?: number;
    finalPrice?: number;
  };
  error?: string;
  message?: string;
  ticketCode?: string;
}

export default function BusinessScanner() { // Component Name Fixed
  const router = useRouter();

  // State
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'SCAN' | 'MANUAL'>('SCAN');

  // Daily Log State
  const [dailyLog, setDailyLog] = useState<{ time: string, name: string, status: string }[]>([]);

  // Scanner Ref to clean up
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only init scanner if in SCAN mode
    if (mode === 'SCAN' && !scanResult) {
      // Short timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
        );
        scannerRef.current = scanner;
        scanner.render(onScanSuccess, onScanFailure);
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err)); // Cleanup
        }
      };
    }
  }, [mode, scanResult]);

  function onScanSuccess(decodedText: string) {
    if (loading || scanResult) return;
    setScanResult(decodedText);
    handleVerify(decodedText); // Auto-verify on scan
    if (scannerRef.current) scannerRef.current.clear();
  }

  function onScanFailure(error: any) {
    // Quietly handle scan failures
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleVerify(manualInput.trim());
  }

  // ✅ MASTER VERIFICATION LOGIC
  const handleVerify = async (inputCode: string) => {
    setLoading(true);
    setResult(null);
    const businessId = localStorage.getItem('businessId');

    if (!businessId) {
      alert("Session Error: Please login again.");
      router.push('/business/login');
      return;
    }

    // Determine if Input is Email (Student ID Logic) or Code (Ticket Logic)
    // Heuristic: If contains "@", likely email. If starts with "SL-", likely Ticket Code. 
    // Fallback: Send both? No, let's send logic based on format.
    // Actually backend handles specific fields. Let's try to send 'ticketCode' first if it matches pattern, else 'studentId' (which might be email or ID)

    const payload: any = { businessId };
    // Regex for our ticket: SL-SWP-
    if (inputCode.toUpperCase().startsWith('SL') || inputCode.startsWith('#')) {
      payload.ticketCode = inputCode;
    } else {
      // Assume Student ID or Email
      // But our new backend verify-redemption expects 'studentId' for ID checks
      // Let's assume input is ID for now.
      payload.studentId = inputCode;
    }

    try {
      const res = await fetch('/api/auth/business/verify-redemption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ success: true, user: data.user, deal: data.deal, message: data.message, ticketCode: data.ticketCode });
        // Add to Daily Log
        const newLog = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          name: data.user?.fullName || "Verified User",
          status: "Success"
        };
        setDailyLog(prev => [newLog, ...prev]);
      } else {
        setResult({ success: false, error: data.error || "Verification Failed" });
      }

    } catch (err) {
      setResult({ success: false, error: "Network Error" });
    } finally {
      setLoading(false);
    }
  }

  const resetScanner = () => {
    setScanResult(null);
    setResult(null);
    setManualInput('');
    setMode('SCAN'); // Reset to Scan mode
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center font-sans text-white pb-20">

      {/* HEADER */}
      <div className="w-full max-w-md p-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black tracking-tight">WIN<span className="text-orange-500"> Deals</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Scanner</p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="w-full max-w-md px-6">

        {/* --- TOGGLE MODE --- */}
        {!scanResult && !loading && (
          <div className="flex bg-white/10 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setMode('SCAN')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'SCAN' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <i className="fa-solid fa-qrcode mr-2"></i> Camera
            </button>
            <button
              onClick={() => setMode('MANUAL')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'MANUAL' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <i className="fa-solid fa-keyboard mr-2"></i> Manual
            </button>
          </div>
        )}

        {/* --- SCANNER VIEWPORT --- */}
        {mode === 'SCAN' && !scanResult && !loading && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative">
            <div id="reader"></div>
            <div className="p-6 text-slate-900 text-center bg-white">
              <p className="font-bold text-sm">Align QR Code within the frame</p>
            </div>
            {/* Overlay Grid/Design if needed */}
          </div>
        )}

        {/* --- MANUAL INPUT --- */}
        {mode === 'MANUAL' && !scanResult && !loading && (
          <form onSubmit={handleManualSubmit} className="bg-white p-8 rounded-3xl shadow-xl">
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Enter Ticket Code</label>
            <input
              type="text"
              placeholder="SL-SWP-XXXX"
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-4 font-mono text-xl font-bold text-slate-900 text-center focus:outline-none focus:border-orange-500 mb-6 uppercase"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg"
            >
              Verify Ticket
            </button>
          </form>
        )}

        {/* --- LOADING --- */}
        {loading && (
          <div className="aspect-square bg-white rounded-3xl flex flex-col items-center justify-center shadow-xl">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-900 font-bold animate-pulse">Verifying...</p>
          </div>
        )}

        {/* --- RESULT OVERLAY --- */}
        {result && (
          <div className="animate-in zoom-in-95 duration-200">
            <ValidationResult
              result={result}
              onReset={resetScanner}
              onRedeemConfirm={async (code) => {
                // Call API with action='REDEEM'
                const res = await fetch('/api/auth/business/verify-redemption', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ businessId: localStorage.getItem('businessId'), ticketCode: code, action: 'REDEEM' })
                });
                if (!res.ok) throw new Error("Redemption Failed");
              }}
            />
          </div>
        )}

        {/* --- DAILY LOG --- */}
        {dailyLog.length > 0 && !result && !loading && (
          <div className="mt-12">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 ml-2">Session History</h3>
            <div className="bg-white/5 rounded-2xl divide-y divide-white/10">
              {dailyLog.map((log, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-bold text-sm text-white">{log.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}