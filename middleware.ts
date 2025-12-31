import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  // If on admin dashboard and no token, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}