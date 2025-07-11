import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface MarketItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'equipment';
  description: string;
  price: number;
  damage?: string; // For weapons (e.g., "1d20")
  armorClass?: number; // For armor
  quantity?: number; // For equipment
}

interface MarketProps {
  username: string;
}

const Market: React.FC<MarketProps> = ({ username }) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketItems();
    fetchUserCredits();
  }, []);

  const fetchMarketItems = async () => {
    try {
      const response = await fetch('/api/market');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        throw new Error('Failed to fetch market items');
      }
    } catch (error) {
      console.error('Error fetching market items:', error);
      toast({
        title: "Error",
        description: "Failed to load market items",
        variant: "destructive",
      });
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch(`/api/wallet/${username}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUserCredits(data.balance);
    } catch (error) {
      console.error('Error fetching user credits:', error);
      toast({
        title: "Error",
        description: "Failed to load user credits. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async (item: MarketItem) => {
    if (userCredits < item.price) {
      toast({
        title: "Insufficient Credits",
        description: "You do not have enough credits to purchase this item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/market/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, itemId: item.id }),
      });

      if (response.ok) {
        setUserCredits(userCredits - item.price);
        toast({
          title: "Purchase Successful",
          description: `You have purchased ${item.name}`,
        });
      } else {
        throw new Error('Failed to purchase item');
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Error",
        description: "Failed to purchase item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="market-container">
      <h2 className="text-2xl font-bold mb-4">Imperium Armory</h2>
      <div className="user-credits mb-4">Available Credits: {userCredits}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="market-item bg-background border border-primary p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-400 mb-2">{item.type}</p>
            <p className="mb-2">{item.description}</p>
            <p className="mb-2">Price: {item.price} credits</p>
            {item.type === 'weapon' && item.damage && (
              <p className="mb-2">Damage: {item.damage}</p>
            )}
            {item.type === 'armor' && item.armorClass && (
              <p className="mb-2">Armor Class: {item.armorClass}</p>
            )}
            {item.type === 'equipment' && item.quantity && (
              <p className="mb-2">Quantity: {item.quantity}</p>
            )}
            <Button onClick={() => handlePurchase(item)} disabled={userCredits < item.price}>
              Purchase
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Market;
