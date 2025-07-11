"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import "../styles/wallet.css"
import { getWalletBalance, updateWalletBalance } from "@/app/actions/wallet"

export default function WalletComponent() {
  const [balance, setBalance] = useState<number | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const username = "Inquisitor" // Hardcoded for now, replace with actual user context

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getWalletBalance(username)
      if (result.success) {
        setBalance(result.balance)
      } else {
        setError(result.message || "Failed to fetch balance.")
        toast({
          title: "Error",
          description: result.message || "Failed to fetch balance.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err)
      setError("An unexpected error occurred while fetching balance.")
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching balance.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async (type: "deposit" | "withdraw") => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid positive amount.")
      return
    }
    if (type === "withdraw" && balance !== null && numAmount > balance) {
      setError("Insufficient funds.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const newBalance = type === "deposit" ? (balance || 0) + numAmount : (balance || 0) - numAmount
      const result = await updateWalletBalance(username, newBalance)

      if (result.success) {
        setBalance(result.balance)
        setAmount("")
        toast({
          title: `${type === "deposit" ? "Deposit" : "Withdrawal"} Successful`,
          description: `Successfully ${type === "deposit" ? "deposited" : "withdrew"} ${numAmount.toFixed(2)} credits.`,
        })
      } else {
        setError(result.message || `Failed to ${type} funds.`)
        toast({
          title: "Error",
          description: result.message || `Failed to ${type} funds.`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(`Error during ${type} transaction:`, err)
      setError("An unexpected error occurred during the transaction.")
      toast({
        title: "Error",
        description: "An unexpected error occurred during the transaction.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wallet-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-6 text-center">Imperial Credits Wallet</h2>

      {loading ? (
        <p className="text-center text-neon">Loading balance...</p>
      ) : error ? (
        <p className="text-center text-red-neon">{error}</p>
      ) : (
        <div className="text-center mb-8">
          <p className="text-xl">Current Balance:</p>
          <p className="text-5xl font-bold text-neon flicker-text">{balance?.toFixed(2) || "0.00"} ℣</p>
        </div>
      )}

      <div className="transaction-section">
        <h3 className="text-neon text-xl mb-4">Manage Funds</h3>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="amount" className="text-neon">
              Amount (℣)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-cyberpunk mt-2"
              step="0.01"
            />
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => handleTransaction("deposit")}
              disabled={loading || !amount}
              className="btn-cyberpunk flex-1"
            >
              Deposit
            </Button>
            <Button
              onClick={() => handleTransaction("withdraw")}
              disabled={loading || !amount || (balance !== null && Number.parseFloat(amount) > balance)}
              className="btn-cyberpunk flex-1 bg-accent-red hover:bg-red-700"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
