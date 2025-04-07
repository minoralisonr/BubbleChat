// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token');
  if (!token && request.nextUrl.pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  return NextResponse.next();
}