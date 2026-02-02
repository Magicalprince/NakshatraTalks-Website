import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/wallet',
  '/recharge',
  '/profile',
  '/settings',
  '/chat',
  '/call',
  '/rating',
  '/history',
];

// Define astrologer routes
const astrologerRoutes = [
  '/dashboard',
  '/earnings',
  '/live',
  '/astrologer-profile',
  '/chat-session',
  '/call-session',
];

// Define public routes that don't need auth
const publicRoutes = [
  '/login',
  '/verify-otp',
  '/horoscope',
  '/kundli',
  '/kundli-matching',
];

// Cookie name for auth check (httpOnly cookie check via existence)
const AUTH_COOKIE_NAME = 'refresh_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = !!authCookie?.value;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is an astrologer route
  const isAstrologerRoute = astrologerRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route (used for future logic)
  const _isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If trying to access protected route without auth, redirect to login
  if ((isProtectedRoute || isAstrologerRoute) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login page, redirect to home
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.nakshatratalks.com wss: https:",
      "frame-src 'self' https://checkout.razorpay.com",
      "media-src 'self' blob:",
    ].join('; ')
  );

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
