import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const messagesFile = path.join(process.cwd(), 'data', 'messages.json');

export async function GET() {
  try {
    const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newMessage = await request.json();
    const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
    messages.push(newMessage);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

