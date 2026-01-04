import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // ✅ FIX: Explicitly delete from the root path
  cookieStore.delete({
    name: 'admin_session',
    path: '/'
  })
  
  return NextResponse.json({ success: true })
}