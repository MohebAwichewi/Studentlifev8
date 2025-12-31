import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json()
  
  if (
    body.username === process.env.ADMIN_USER && 
    body.password === process.env.ADMIN_PASSWORD
  ) {
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
      path: '/' 
    })
    
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json({ success: false }, { status: 401 })
}