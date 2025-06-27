import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Allow access to login and setup pages without authentication
  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return NextResponse.next()
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get("admin_session")

  // If accessing admin pages without a session, redirect to login
  if (pathname.startsWith("/admin") && !sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
