//src/app/api/auth/signup/route.js
// Do not modify this file anymore unless necessary. This is a critical API route for handling user signup.
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@lib/postgres';
import { createToken } from '@lib/auth';

// Conditional mock import - only in development
const isDev = process.env.NODE_ENV === 'development';
let mockDbUtils;
if (isDev) {
  try {
    mockDbUtils = require('@/app/api/_mock/db').mockDbUtils;
  } catch (e) {
    console.warn('Mock DB not found, using real database');
  }
}

export async function POST(request) {
  let client;
  try {
    const { username, email, password } = await request.json();
    
    // Input validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    client = await connectToDatabase();

    // Check for existing user
    const existingUserQuery = 'SELECT id, email FROM users WHERE email = $1 OR username = $2';
    const existingUserResult = await client.query(existingUserQuery, [
      email.toLowerCase().trim(),
      username.trim()
    ]);

    if (existingUserResult.rows.length > 0) {
      const existingField = existingUserResult.rows[0].email === email.toLowerCase() ? 'email' : 'username';
      return NextResponse.json(
        { 
          message: `User with this ${existingField} already exists`,
          field: existingField
        },
        { status: 409 }
      );
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with PostgreSQL-generated UUID
    const insertQuery = `
      INSERT INTO users (id, username, email, password)
      VALUES (gen_random_uuid(), $1, $2, $3)
      RETURNING id, username, email
    `;
    
    const insertResult = await client.query(insertQuery, [
      username.trim(),
      email.toLowerCase().trim(),
      hashedPassword
    ]);

    const newUser = insertResult.rows[0];

    // Create JWT token
    const token = createToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    });

    // Prepare success response
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      token
    }, { status: 201 });

    // Set secure HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    
    // Special handling for gen_random_uuid() error
    if (error.message.includes('gen_random_uuid()')) {
      return NextResponse.json(
        { 
          message: 'Database configuration error - contact admin',
          error: 'UUID generation function not available'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) await client.release();
  }
}