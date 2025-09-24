import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

export async function GET() {
  try {
    await redis.set('test-key', 'Hello, Redis!');
    const value = await redis.get('test-key');
    return NextResponse.json({ success: true, value });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }
}

