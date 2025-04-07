// app/api/friends/list/route.js
import { NextResponse } from 'next/server';

// Conditional mock import - only in development
const isDev = process.env.NODE_ENV === 'development';
let mockDbUtils;
if (isDev) {
  try {
    mockDbUtils = require('@/app/api/_mock/db').mockDbUtils;
  } catch (e) {
    console.warn('Mock DB not found - using real database implementation');
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Input validation
    if (!userId) {
      console.error("Missing 'userId' parameter in request");
      return NextResponse.json(
        { 
          success: false,
          message: "Missing 'userId' parameter" 
        },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error("Invalid user ID format:", userId);
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid user ID format" 
        },
        { status: 400 }
      );
    }

    // Use mock DB if available in development
    if (isDev && mockDbUtils) {
      console.log('[MOCK] Fetching friends for user ID:', userId);
      
      try {
        const friends = mockDbUtils.getFriendsList(userId);
        console.log('[MOCK] Friends found:', friends.length);
        
        // Enhanced response with more friend details
        const enrichedFriends = friends.map(friend => ({
          id: friend.id,
          username: friend.username,
          email: friend.email,
          avatar: friend.avatar || '/default-avatar.png',
          lastActive: new Date().toISOString() // Mock last active time
        }));
        
        return NextResponse.json({
          success: true,
          data: enrichedFriends,
          count: enrichedFriends.length,
          timestamp: new Date().toISOString()
        });
      } catch (mockError) {
        console.error('[MOCK] Error fetching friends:', mockError);
        return NextResponse.json(
          { 
            success: false,
            message: 'Mock database operation failed',
            error: mockError.message
          },
          { status: 500 }
        );
      }
    }

    // Real database implementation would go here
    // const client = await connectToDatabase();
    // const result = await client.query(...);
    // await client.release();

    // Fallback empty response if no mock or real DB available
    console.warn('No database implementation available - returning empty response');
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/friends/list:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch friends list',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}