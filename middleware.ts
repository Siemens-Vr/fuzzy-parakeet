import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/developer'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect to dashboard if accessing auth routes with valid token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/developer', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/developer/:path*', '/auth/:path*'],
};