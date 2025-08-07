import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;
  
  // Handle authentication pages (login/register)
  if (pathname.startsWith('/auth')) {
    if (token) {
      // If already logged in, redirect based on role
      const role = (token as any).role;
      const redirectUrl = role === 'ADMIN' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const role = (token as any).role;

  // Handle root path redirects
  if (pathname === '/') {
    const redirectUrl = role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect user routes from admin access
  if (pathname.startsWith('/dashboard') && role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    const role = (token as any).role;
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
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
