'use client'

import React from 'react'

export default function PromoBanner() {
    return (
        <div className="w-full bg-gradient-to-r from-[#E60023] via-[#FF1744] to-[#E60023] text-white overflow-hidden relative">
            {/* Animated scrolling container */}
            <div className="animate-scroll-left whitespace-nowrap py-2.5 flex items-center gap-8">
                {/* Repeat the content multiple times for seamless loop */}
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="inline-flex items-center gap-8 px-4">
                        {/* Gift Icon */}
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-gift text-xl animate-bounce"></i>
                            <span className="font-black text-lg tracking-wider">Win EL DEAL ?</span>
                        </div>

                        {/* Sunglasses Icon */}
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-glasses text-xl animate-pulse"></i>
                            <span className="font-black text-lg tracking-wider">Win EL DEAL ?</span>
                        </div>

                        {/* Shoe Icon */}
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-shoe-prints text-xl animate-bounce"></i>
                            <span className="font-black text-lg tracking-wider">Win EL DEAL ?</span>
                        </div>

                        {/* Gift Box Icon */}
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-box-open text-xl animate-pulse"></i>
                            <span className="font-black text-lg tracking-wider">Win EL DEAL ?</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sparkle effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-[10%] w-1 h-1 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-1/2 left-[30%] w-1 h-1 bg-white rounded-full animate-ping opacity-75 animation-delay-200"></div>
                <div className="absolute top-1/2 left-[50%] w-1 h-1 bg-white rounded-full animate-ping opacity-75 animation-delay-400"></div>
                <div className="absolute top-1/2 left-[70%] w-1 h-1 bg-white rounded-full animate-ping opacity-75 animation-delay-600"></div>
                <div className="absolute top-1/2 left-[90%] w-1 h-1 bg-white rounded-full animate-ping opacity-75 animation-delay-800"></div>
            </div>

            {/* CSS for scrolling animation */}
            <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>
        </div>
    )
}
