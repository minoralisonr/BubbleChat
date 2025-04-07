// app/api/users/search/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@lib/postgres';

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        
        console.log('Search request for:', query);
        
        if (!query) {
            return NextResponse.json(
                { message: "Missing search query" },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        if (!client) {
            return NextResponse.json(
                { message: 'Database connection error' },
                { status: 500 }
            );
        }

        const searchQuery = `
            SELECT id, username, email 
            FROM users 
            WHERE username ILIKE $1 OR email ILIKE $1
            LIMIT 10
        `;
        const result = await client.query(searchQuery, [`%${query}%`]);
        
        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { message: 'Search failed', error: error.message },
            { status: 500 }
        );
    } finally {
        if (client) {
            try {
                await client.release();
            } catch (releaseError) {
                console.error('DB release error:', releaseError);
            }
        }
    }
}