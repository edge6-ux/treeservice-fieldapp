import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect master panel
  if (pathname.startsWith('/master')) {
    if (pathname === '/master/login') return NextResponse.next()

    const masterAuth = request.cookies.get('master_authed')?.value
    if (masterAuth !== 'true') {
      return NextResponse.redirect(new URL('/master/login', request.url))
    }
  }

  // Protect operator dashboards (skip login page)
  if (pathname.includes('/admin') && !pathname.includes('/login')) {
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
