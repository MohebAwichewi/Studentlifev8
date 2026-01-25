import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // ✅ FIX: Use the exact name you used during login ('admin_token')
  cookieStore.delete('admin_token')
  
  return NextResponse.json({ success: true })
}