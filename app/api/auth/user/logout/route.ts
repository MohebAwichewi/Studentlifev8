import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // Delete the student session cookie
  cookieStore.delete('student_session')
  
  return NextResponse.json({ success: true })
}