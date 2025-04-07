import { NextResponse } from 'next/server';
import { connectToDatabase } from '@lib/postgres';

export async function POST(request) {
  try {
    const body = await request.json();
    const { senderId, recipientId } = body;

    // Validate input
    if (!senderId || !recipientId) {
      return NextResponse.json(
        { message: 'Both senderId and recipientId are required' },
        { status: 400 }
      );
    }

    if (senderId === recipientId) {
      return NextResponse.json(
        { message: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    try {
      // Check if users exist
      const userCheck = await client.query(
        'SELECT id FROM users WHERE id IN ($1, $2)',
        [senderId, recipientId]
      );
      
      if (userCheck.rows.length !== 2) {
        const missingUser = userCheck.rows.some(u => u.id === senderId) ? recipientId : senderId;
        return NextResponse.json(
          { message: 'User not found', userId: missingUser },
          { status: 404 }
        );
      }

      // Check if request already exists
      const existingRequest = await client.query(
        `SELECT id FROM friend_requests 
         WHERE ((sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1))
         AND status = 'pending'`,
        [senderId, recipientId]
      );

      if (existingRequest.rows.length > 0) {
        return NextResponse.json(
          { message: 'Friend request already exists' },
          { status: 409 }
        );
      }

      // Check if they're already friends
      const existingFriendship = await client.query(
        `SELECT id FROM friend_requests 
         WHERE ((sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1))
         AND status = 'accepted'`,
        [senderId, recipientId]
      );

      if (existingFriendship.rows.length > 0) {
        return NextResponse.json(
          { message: 'You are already friends with this user' },
          { status: 409 }
        );
      }

      // Create new request
      const result = await client.query(
        `INSERT INTO friend_requests (sender_id, recipient_id, status, created_at)
         VALUES ($1, $2, 'pending', NOW())
         RETURNING *`,
        [senderId, recipientId]
      );

      return NextResponse.json({
        success: true,
        request: result.rows[0]
      }, { status: 201 });

    } finally {
      await client.release();
    }
  } catch (error) {
    console.error('Error in friend request:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}