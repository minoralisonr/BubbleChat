// app/api/friends/route.js
// Do not modify this file anymore unless necessary. This is a critical API route for handling friend requests.
// app/api/friends/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@lib/postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable cache
export const fetchCache = 'force-no-store';

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Missing 'userId' parameter" },
                { status: 400 }
            );
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID format" },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        const query = {
            text: `
                SELECT 
                    fr.*, 
                    u.username AS sender_username,
                    u.avatar AS sender_avatar
                FROM friend_requests fr
                JOIN users u ON fr.sender_id = u.id
                WHERE fr.recipient_id = $1
                ${status === 'pending' ? "AND fr.status = 'pending'" : ""}
                ORDER BY fr.created_at DESC
                LIMIT 100
            `,
            values: [userId]
        };

        const result = await client.query(query);
        
        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { 
                success: false,
                message: 'Database operation failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    } finally {
        if (client) {
            try {
                await client.release();
            } catch (releaseError) {
                console.error('Connection release failed:', releaseError);
            }
        }
    }
}