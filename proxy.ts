import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
	const token = request.cookies.get('accessToken')?.value;
	const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
	const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

	if (!token && isDashboardRoute) {
		// Disabled: tokens are in localStorage, not cookies
		// return NextResponse.redirect(new URL('/login', request.url));
	}


	if (token && isAuthRoute) {
		// Disabled: tokens are in localStorage, not cookies
		// return NextResponse.redirect(new URL('/dashboard', request.url));
	}


	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/login', '/register'],
};