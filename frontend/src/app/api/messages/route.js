import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chatId')

  try {
    const client = await connectToDatabase()
    const db = client.db('bubble-chat')
    
    const messages = await db.collection('messages')
      .find({ chatId })
      .sort({ timestamp: 1 })
      .toArray()

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { content, senderId, receiverId, chatId } = await request.json()
    const client = await connectToDatabase()
    const db = client.db('bubble-chat')
    
    const result = await db.collection('messages').insertOne({
      content,
      senderId: new ObjectId(senderId),
      receiverId: new ObjectId(receiverId),
      chatId,
      timestamp: new Date()
    })

    return NextResponse.json({
      message: 'Message sent successfully',
      messageId: result.insertedId
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// app/api/friends/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    const client = await connectToDatabase()
    const db = client.db('bubble-chat')
    
    const friends = await db.collection('friends')
      .find({ userId: new ObjectId(userId) })
      .toArray()

    return NextResponse.json({ friends })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch friends' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { userId, friendId } = await request.json()
    const client = await connectToDatabase()
    const db = client.db('bubble-chat')
    
    const result = await db.collection('friends').insertOne({
      userId: new ObjectId(userId),
      friendId: new ObjectId(friendId),
      createdAt: new Date()
    })

    return NextResponse.json({
      message: 'Friend added successfully',
      friendshipId: result.insertedId
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add friend' },
      { status: 500 }
    )
  }
}