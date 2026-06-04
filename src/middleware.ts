import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ea-vault-jwt-secret-key-1234567890'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Verify token
  let payload: any = null;
  if (token) {
    try {
      const { payload: verified } = await jwtVerify(token, JWT_SECRET);
      payload = verified;
    } catch {
      // Invalid token
    }
  }

  // Define route matching
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isAccountRoute = pathname.startsWith('/account');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. Redirect public auth and account routes to home page
  if (isAuthRoute || isAccountRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. If trying to access Admin routes
  if (isAdminRoute) {
    if (pathname === '/admin/login') {
      if (payload && payload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!payload || payload.role !== 'admin') {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  return NextResponse.next();
}

// Config to apply middleware to paths
export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/login', '/signup', '/forgot-password'],
};
