import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const url = request.nextUrl.pathname

  if (url.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (url.startsWith('/portal') && !token) {
    return NextResponse.redirect(new URL('/cliente', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}
