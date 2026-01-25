'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SwipeProps {
  onComplete: () => void
  disabled?: boolean
  disabledText?: string
  resetTrigger?: boolean
}

export default function SwipeToRedeem({ onComplete, disabled, disabledText, resetTrigger }: SwipeProps) {
  const [dragWidth, setDragWidth] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)

  useEffect(() => {
    if (resetTrigger) {
        setDragWidth(0)
        setIsCompleted(false)
    }
  }, [resetTrigger])

  const handleStart = (clientX: number) => {
    if (disabled || isCompleted) return
    isDragging.current = true
    startX.current = clientX
  }

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current || isCompleted) return
    
    const containerWidth = containerRef.current.clientWidth
    const maxDrag = containerWidth - 56 // 56 is handle width
    const offset = clientX - startX.current
    
    // Calculate percentage (0 to 100)
    let newWidth = Math.max(0, Math.min(offset, maxDrag))
    setDragWidth(newWidth)

    // Check Threshold (90% to trigger)
    if (newWidth >= maxDrag * 0.95) {
        isDragging.current = false
        setDragWidth(maxDrag)
        setIsCompleted(true)
        onComplete()
    }
  }

  const handleEnd = () => {
    if (isCompleted) return
    isDragging.current = false
    setDragWidth(0) // Snap back
  }

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX)
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX)
  const onMouseUp = () => handleEnd()

  // Touch Events (Mobile)
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX)
  const onTouchEnd = () => handleEnd()

  return (
    <div 
        ref={containerRef}
        className={`relative w-full h-14 rounded-full overflow-hidden select-none touch-none transition-colors duration-300 ${isCompleted ? 'bg-green-500' : disabled ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900'}`}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
        {/* Background Text */}
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm tracking-widest uppercase transition-opacity duration-300 ${isCompleted ? 'opacity-0' : 'opacity-100'} ${disabled ? 'text-slate-400' : 'text-white/50'}`}>
            {isCompleted ? 'REDEEMED' : disabled ? (disabledText || 'LOCKED') : 'SWIPE TO REDEEM > > >'}
        </div>

        {/* Success Text */}
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-white tracking-widest uppercase transition-opacity duration-300 ${isCompleted ? 'opacity-100' : 'opacity-0'}`}>
            SUCCESS!
        </div>

        {/* The Slider Handle */}
        <div 
            className="absolute top-1 left-1 h-12 w-12 bg-white rounded-full shadow-md flex items-center justify-center z-10 transition-transform duration-75 ease-out"
            style={{ transform: `translateX(${dragWidth}px)` }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {isCompleted ? (
                <i className="fa-solid fa-check text-green-500 text-xl animate-in zoom-in"></i>
            ) : disabled ? (
                <i className="fa-solid fa-lock text-slate-300"></i>
            ) : (
                <i className="fa-solid fa-chevron-right text-slate-900"></i>
            )}
        </div>
    </div>
  )
}