import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Mission } from '@/types/missions';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedMission = await request.json();
    let missions = await redis.get('missions') as Mission[] || [];
    
    const index = missions.findIndex(mission => mission.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }
    
    missions[index] = { ...missions[index], ...updatedMission };
    await redis.set('missions', missions);
    
    return NextResponse.json(missions[index]);
  } catch (error) {
    console.error('Error updating mission:', error);
    return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let missions = await redis.get('missions') as Mission[] || [];
    
    missions = missions.filter(mission => mission.id !== id);
    await redis.set('missions', missions);
    
    return NextResponse.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    console.error('Error deleting mission:', error);
    return NextResponse.json({ error: 'Failed to delete mission' }, { status: 500 });
  }
}

