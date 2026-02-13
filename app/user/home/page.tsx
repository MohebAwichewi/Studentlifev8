'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeRedirect() {
   const router = useRouter()

   useEffect(() => {
      router.replace('/user/dashboard')
   }, [router])

   return (
      <div className="min-h-screen flex items-center justify-center bg-white">
         <div className="animate-spin h-8 w-8 border-2 border-[#D90020] border-t-transparent rounded-full"></div>
      </div>
   )
}
