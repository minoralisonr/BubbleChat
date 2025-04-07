import { NextResponse } from 'next/server';
import { connectToDatabase } from '@lib/postgres';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'pending';

    if (!userId) {
      return NextResponse.json(
        { message: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    try {
      const result = await client.query(
        `SELECT fr.*, 
                u1.username as sender_username,
                u2.username as recipient_username
         FROM friend_requests fr
         JOIN users u1 ON fr.sender_id = u1.id
         JOIN users u2 ON fr.recipient_id = u2.id
         WHERE (fr.sender_id = $1 OR fr.recipient_id = $1)
         AND fr.status = $2
         ORDER BY fr.created_at DESC`,
        [userId, status]
      );

      const requests = result.rows.map(row => ({
        id: row.id,
        senderId: row.sender_id,
        recipientId: row.recipient_id,
        status: row.status,
        createdAt: row.created_at,
        senderUsername: row.sender_username,
        recipientUsername: row.recipient_username,
        isIncoming: row.recipient_id === userId
      }));

      return NextResponse.json({ requests });

    } finally {
      await client.release();
    }
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}