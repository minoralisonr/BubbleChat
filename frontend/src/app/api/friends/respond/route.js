// app/api/friends/respond/route.js
import { NextResponse } from 'next/server';
import { mockDbUtils } from '../../_mock/db';
import { connectToDatabase } from '@lib/postgres';

export async function POST(request) {
  try {
    // Validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { requestId, action } = requestBody;
    
    // Validate required parameters
    if (!requestId || !action) {
      return NextResponse.json(
        { 
          message: "Missing required parameters",
          required: { requestId: 'number', action: "'accept' or 'decline'" }
        },
        { status: 400 }
      );
    }

    // Validate action value
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { 
          message: "Invalid action value",
          validActions: ['accept', 'decline']
        },
        { status: 400 }
      );
    }

    const status = action === 'accept' ? 'accepted' : 'declined';

    try {
      let updatedRequest;
      
      if (process.env.NODE_ENV === 'development' && mockDbUtils) {
        // Mock implementation
        updatedRequest = mockDbUtils.respondToRequest(parseInt(requestId), status);
        if (!updatedRequest) {
          throw new Error('Request not found or already processed');
        }
      } else {
        // Production implementation
        const client = await connectToDatabase();
        try {
          // First verify the request exists and is pending
          const verifyQuery = `
            SELECT id FROM friend_requests 
            WHERE id = $1 AND status = 'pending'
            FOR UPDATE
          `;
          const verifyResult = await client.query(verifyQuery, [requestId]);
          
          if (verifyResult.rows.length === 0) {
            throw new Error('Request not found, already processed, or not pending');
          }

          // Update the request
          const updateQuery = `
            UPDATE friend_requests
            SET status = $1, 
                updated_at = NOW()
            WHERE id = $2
            RETURNING *
          `;
          const result = await client.query(updateQuery, [status, requestId]);
          updatedRequest = result.rows[0];

          // If accepting, you might want to create a friendship record here
          if (action === 'accept') {
            // Optional: Add logic to create a friendship record
            // in a separate table if your app tracks accepted friends
          }
        } finally {
          await client.release();
        }
      }

      if (!updatedRequest) {
        throw new Error('Failed to update friend request');
      }

      return NextResponse.json({
        success: true,
        message: `Friend request ${status} successfully`,
        request: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          updatedAt: updatedRequest.updated_at
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          message: dbError.message.includes('not found') ? 
                  'Friend request not found' : 
                  'Failed to process request',
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: dbError.message.includes('not found') ? 404 : 500 }
      );
    }
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';