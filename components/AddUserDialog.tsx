"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AddUserDialogProps {
  onUserAdded: () => void
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleAddUser = async () => {
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "User Added",
          description: `User "${username}" has been successfully added.`,
        })
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        setIsOpen(false)
        onUserAdded() // Notify parent component
      } else {
        setError(data.message || "Failed to add user.")
        toast({
          title: "Error",
          description: data.message || "Failed to add user.",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-cyberpunk">Add New User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] panel-cyberpunk">
        <DialogHeader>
          <DialogTitle className="text-neon">Add New User</DialogTitle>
          <DialogDescription className="text-neon">Enter the details for the new user account.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-red-neon text-sm">{error}</p>}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-neon">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3 input-cyberpunk"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right text-neon">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3 input-cyberpunk"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right text-neon">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="col-span-3 input-cyberpunk"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddUser} className="btn-cyberpunk">
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
