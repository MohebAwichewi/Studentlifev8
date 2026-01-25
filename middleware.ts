import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // 1. Define Paths
  const isAdminPath = path.startsWith('/admin')
  const isLoginPath = path === '/admin/login'

  // 2. Get Admin Token (Cookies are visible to Middleware)
  const adminToken = req.cookies.get('admin_token')?.value

  // 3. ADMIN PROTECTION (Keep this!)
  if (isAdminPath) {
    // A. If going to Login Page
    if (isLoginPath) {
      // If already logged in, redirect to Dashboard
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      return NextResponse.next() // Allow access to login page
    }

    // B. If going to any other Admin page (Dashboard, etc.)
    if (!adminToken) {
      // If no token, kick them back to login
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // 4. STUDENT PROTECTION REMOVED 
  // (Your Student Dashboard page handles this check on the client side now)

  return NextResponse.next()
}

// Apply ONLY to Admin routes
export const config = {
  matcher: [
    '/admin/:path*',
    // Removed '/student/:path*' so the middleware ignores student pages
  ]
}