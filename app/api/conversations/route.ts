import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { findUser } from '@/lib/users';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const userConversations = await redis.lrange(`user:${username}:conversations`, 0, -1);
    const conversations = userConversations.map(conv => {
      try {
        return typeof conv === 'string' ? JSON.parse(conv) : conv;
      } catch (error) {
        console.error('Error parsing conversation:', error);
        return null;
      }
    }).filter(conv => conv !== null);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, currentUser } = await request.json();
    
    if (!userId || !currentUser) {
      return NextResponse.json({ error: 'User ID and current user are required' }, { status: 400 });
    }

    const user = await findUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'No user found with this Empire ID' }, { status: 404 });
    }

    // Check if conversation already exists for either user
    const currentUserConversations = await redis.lrange(`user:${currentUser}:conversations`, 0, -1);
    const targetUserConversations = await redis.lrange(`user:${userId}:conversations`, 0, -1);

    const currentUserHasConversation = currentUserConversations.some(conv => {
      const parsed = typeof conv === 'string' ? JSON.parse(conv) : conv;
      return parsed.name === userId;
    });

    const targetUserHasConversation = targetUserConversations.some(conv => {
      const parsed = typeof conv === 'string' ? JSON.parse(conv) : conv;
      return parsed.name === currentUser;
    });

    if (currentUserHasConversation || targetUserHasConversation) {
      return NextResponse.json({ error: 'Conversation already exists with this user' }, { status: 400 });
    }

    // Create a unique conversation ID
    const conversationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newConversation = {
      id: conversationId,
      name: userId,
      isOnline: false,
      unread: 0
    };

    // Add conversation to both users
    await redis.rpush(`user:${currentUser}:conversations`, JSON.stringify(newConversation));
    await redis.rpush(`user:${userId}:conversations`, JSON.stringify({...newConversation, name: currentUser}));

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error('Failed to add user:', error);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}

