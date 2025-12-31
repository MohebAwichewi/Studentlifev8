import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers' // 👈 Needed for session cookies

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    const cookieStore = await cookies() // Prepare the cookie tool

    // ---------------------------------------------------------
    // 1. BACKDOOR: Demo Login Logic
    // ---------------------------------------------------------
    if (email === 'demo@student.tn' && otp === '123456') {
      // Create/Ensure demo user exists in DB
      await prisma.student.upsert({
        where: { email },
        update: {},
        create: { email }
      })
      
      // ✅ Set Session Cookie (So demo user stays logged in)
      cookieStore.set('student_session', 'active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/' 
      })

      return NextResponse.json({ success: true })
    }

    // ---------------------------------------------------------
    // 2. REAL USER: Database Verification Logic
    // ---------------------------------------------------------
    
    // Find the token in the database
    const validToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: { // Composite key search
          identifier: email,
          token: otp
        }
      }
    })

    // Check if token exists
    if (!validToken) {
      return NextResponse.json({ error: 'Invalid Verification Code' }, { status: 400 })
    }

    // Check if expired
    if (new Date() > validToken.expires) {
      return NextResponse.json({ error: 'Code has expired. Please try again.' }, { status: 400 })
    }

    // 3. Success! Delete the used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: otp } }
    })

    // 4. Create or Update the Student Record
    await prisma.student.upsert({
      where: { email },
      update: {},
      create: { email }
    })

    // ✅ Set Session Cookie (So real user stays logged in)
    cookieStore.set('student_session', 'active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Login Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}