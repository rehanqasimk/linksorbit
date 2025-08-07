import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // If trying to access auth pages while logged in, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isAuthPage && !token && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect root to dashboard if logged in, or login if logged out
  if (request.nextUrl.pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

// Add your protected routes here
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/auth/:path*',
    '/merchants/:path*',
    '/reports/:path*',
    '/payments/:path*',
    '/account/:path*',
  ],
};
