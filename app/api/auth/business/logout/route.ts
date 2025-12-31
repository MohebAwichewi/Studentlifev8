import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // Specificially delete the business session, not the admin one
  cookieStore.delete('business_session')
  
  return NextResponse.json({ success: true })
}