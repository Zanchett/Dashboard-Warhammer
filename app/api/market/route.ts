import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

interface MarketItem {
  id: string
  name: string
  description: string
  price: number
  stock: number
}

// Seed initial market data if not present
async function seedMarketData() {
  const itemCount = await redis.llen('market:all_ids');
  if (itemCount === 0) {
    const initialItems: MarketItem[] = [
      {
        id: 'item1',
        name: 'Plasma Cell',
        description: 'Standard power cell for energy weapons.',
        price: 50,
        stock: 100,
      },
      {
        id: 'item2',
        name: 'Medikit',
        description: 'Basic medical supplies for field treatment.',
        price: 75,
        stock: 50,
      },
      {
        id: 'item3',\
        name: 'Data-Slate
