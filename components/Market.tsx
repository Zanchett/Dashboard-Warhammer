"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import { getMarketItems, purchaseMarketItem } from "@/app/actions/market"
import { getWalletBalance } from "@/app/actions/wallet"

interface MarketItem {
  id: string
  name: string
  description: string
  price: number
  stock: number
}

export default function Market() {
  const [marketItems, setMarketItems] = useState<MarketItem[]>([])
  const [userCredits, setUserCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const username = "Inquisitor" // Hardcoded for now, replace with actual user context

  const fetchData = async () => {
    setLoading(true)
    try {
      const [itemsResult, walletResult] = await Promise.all([getMarketItems(), getWalletBalance(username)])

      if (itemsResult.success && itemsResult.items) {
        setMarketItems(itemsResult.items)
      } else {
        toast({
          title: "Error",
          description: itemsResult.message || "Failed to fetch market items.",
          variant: "destructive",
        })
      }

      if (walletResult.success) {
        setUserCredits(walletResult.balance || 0)
      } else {
        toast({
          title: "Error",
          description: walletResult.message || "Failed to fetch wallet balance.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching market data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePurchase = async (itemId: string) => {
    const itemToPurchase = marketItems.find((item) => item.id === itemId)

    if (!itemToPurchase) {
      toast({
        title: "Purchase Error",
        description: "Item not found.",
        variant: "destructive",
      })
      return
    }

    if (userCredits < itemToPurchase.price) {
      toast({
        title: "Insufficient Funds",
        description: "Not enough credits to purchase this item.",
        variant: "destructive",
      })
      return
    }

    if (itemToPurchase.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await purchaseMarketItem(username, itemId)
      if (result.success) {
        toast({
          title: "Item Purchased",
          description: `You have successfully purchased ${itemToPurchase.name}.`,
        })
        // Update state to reflect purchase
        setMarketItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, stock: item.stock - 1 } : item)))
        setUserCredits((prev) => prev - itemToPurchase.price)
      } else {
        toast({
          title: "Purchase Failed",
          description: result.message || "Failed to complete purchase.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during purchase:", error)
      toast({
        title: "Purchase Error",
        description: "An unexpected error occurred during purchase.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="market-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-6 text-center">Imperial Market</h2>

      <div className="mb-6 text-center">
        <p className="text-xl">
          Your Credits: <span className="text-neon font-bold">{userCredits.toFixed(2)} ℣</span>
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        {loading ? (
          <p className="text-center text-neon">Loading market...</p>
        ) : marketItems.length === 0 ? (
          <p className="text-center text-muted-foreground">No items available in the market.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketItems.map((item) => (
              <Card key={item.id} className="market-item-card panel-cyberpunk">
                <CardHeader>
                  <CardTitle className="text-neon text-xl flex items-center">
                    <Icons.shoppingCart className="mr-2 h-5 w-5" /> {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neon">{item.price} ℣</span>
                    <span className="text-sm text-muted-foreground">Stock: {item.stock}</span>
                  </div>
                  <Button
                    onClick={() => handlePurchase(item.id)}
                    disabled={item.stock <= 0 || userCredits < item.price}
                    className="btn-cyberpunk"
                  >
                    {item.stock <= 0 ? "Out of Stock" : "Buy"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
