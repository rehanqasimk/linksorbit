import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;
  
  // Add a short circuit for API routes - don't apply middleware to them
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
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

  // Require authentication for protected routes
  if (!token && 
     (pathname === '/' || 
      pathname.startsWith('/dashboard') || 
      pathname.startsWith('/admin') ||
      pathname.startsWith('/program'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Handle root path redirects
  if (pathname === '/') {
    const role = token ? (token as any).role : null;
    const redirectUrl = role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && token) {
    const role = (token as any).role;
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect publisher routes from admin access
  if (pathname.startsWith('/dashboard') && token) {
    const role = (token as any).role;
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Add your protected routes here
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/program/:path*',
    '/programs/:path*',
    '/reports/:path*',
    '/incentives/:path*',
  ],
};
