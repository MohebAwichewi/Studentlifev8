'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Added missing import
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BusinessScanner() {
  const router = useRouter(); // ✅ Added missing definition
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // 1. Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      scanner.clear(); // Stop scanning once we get a result
      setScanResult(decodedText);
      verifyStudent(decodedText);
    }

    function onScanFailure(error: any) {
      // Quietly handle scan failures
    }

    return () => {
      scanner.clear();
    };
  }, []);

  // 2. Database Verification Logic
  const verifyStudent = async (email: string) => {
    setIsVerifying(true);
    try {
      // We check our real database for this student email
      const res = await fetch(`/api/business/verify-student?email=${email}`);
      const data = await res.json();
      
      if (data.verified) {
        setStudentInfo(data.student);
      } else {
        setStudentInfo({ error: "Invalid or Unverified ID" });
      }
    } catch (err) {
      setStudentInfo({ error: "Connection Error" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center font-sans text-white">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight">Student<span className="text-orange-500">.LIFE</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Verification Scanner</p>
        </header>

        {/* --- SCANNER VIEWPORT --- */}
        {!scanResult && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div id="reader"></div>
            <div className="p-6 text-slate-900 text-center">
                <p className="font-bold">Position Student QR in frame</p>
            </div>
          </div>
        )}

        {/* --- VERIFICATION RESULTS --- */}
        {scanResult && (
          <div className="animate-[fadeIn_0.3s_ease-out] w-full">
            {isVerifying ? (
              <div className="p-12 text-center bg-white/10 rounded-3xl border border-white/10">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold">Checking Database...</p>
              </div>
            ) : studentInfo?.error ? (
              <div className="bg-red-500/20 border border-red-500 p-8 rounded-3xl text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-black text-red-500">ACCESS DENIED</h2>
                <p className="text-red-200 mt-2 font-medium">{studentInfo.error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 w-full py-3 bg-red-500 text-white font-bold rounded-xl">Try Again</button>
              </div>
            ) : (
              <div className="bg-emerald-500/20 border border-emerald-500 p-8 rounded-3xl text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-black text-emerald-400">VERIFIED STUDENT</h2>
                
                <div className="mt-6 p-4 bg-white/5 rounded-2xl text-left space-y-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Student Name</p>
                    <p className="text-lg font-bold">{studentInfo?.fullName || "Verified User"}</p>
                    <div className="h-[1px] bg-white/10 my-2"></div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">University</p>
                    <p className="text-sm font-medium">University of Tunis</p>
                </div>

                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-8 w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30"
                >
                  Verify Next Student
                </button>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={() => router.back()} 
          className="mt-10 text-slate-500 font-bold text-sm flex items-center gap-2 mx-auto"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    </div>
  );
}