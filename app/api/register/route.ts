import { NextResponse } from 'next/server';
import { addUser, findUser } from '../../../lib/users';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    console.log('Registration attempt for username:', username);

    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const existingUser = await findUser(username);
    if (existingUser) {
      console.log('Username already exists');
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const newUser = await addUser(username, password);
    console.log('User registered successfully:', newUser.id);
    return NextResponse.json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An error occurred during registration', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

