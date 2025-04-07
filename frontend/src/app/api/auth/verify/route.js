import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'No authentication token found',
          user: null 
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Return user data in consistent structure
    return NextResponse.json({
      authenticated: true,
      error: null,
      user: {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username
      }
    });

  } catch (error) {
    console.error('Verification error:', error.message);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Invalid or expired session',
        user: null
      },
      { status: 401 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';