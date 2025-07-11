import { NextResponse } from 'next/server';
import { findUser } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await findUser(userId);

    if (user) {
      return NextResponse.json({ message: 'User found' });
    } else {
      return NextResponse.json({ error: 'No user found with this Empire ID' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'An error occurred while checking the user' }, { status: 500 });
  }
}
