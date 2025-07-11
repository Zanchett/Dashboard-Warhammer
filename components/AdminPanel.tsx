"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddUserDialog } from "./AddUserDialog"
import { Icons } from "./icons"
import "../styles/admin-panel.css"
import { getUsers, deleteUser } from "@/app/actions/admin"
import { getMissions, createMission, toggleMissionStatus } from "@/app/actions/missions"
import {
  getUserData,
  updateUserBalance,
  updateUserCharacterSheet,
  addUpgradeCategory,
  getUpgradeCategories,
  addUpgrade,
  getUpgrades,
  assignUpgradeToUser,
  type Upgrade,
  removeUpgradeFromUser,
  editUpgrade,
  cleanUpgradesDatabase,
} from "@/app/actions/admin"
import { getUserTechPoints, updateUserTechPoints } from "@/app/actions/admin"
import type { CharacterSheet } from "@/types/character-sheet"
import type { Mission } from "@/types/missions"
import { Folder, File, Plus, Edit, Trash, RefreshCw, Trash2 } from "lucide-react"
import { getLibraryContent, addLibraryItem, type LibraryItem, deleteLibraryItem } from "@/app/actions/library"
import { Toggle } from "@/components/ui/toggle"
import { Slider } from "@/components/ui/slider"
import { toast } from "react-toastify"

interface ShipSystem {
  name: string
  status: boolean
}

interface MarketItem {
  id: string
  name: string
  type: "weapon" | "armor" | "equipment"
  description: string
  price: number
  damage?: string
  armorClass?: number
  quantity?: number
  isShown: boolean
}

interface User {
  id: string
  username: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [newMissionTitle, setNewMissionTitle] = useState("")
  const [newMissionDescription, setNewMissionDescription] = useState("")
  const [newMissionReward, setNewMissionReward] = useState<number>(0)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingMissions, setLoadingMissions] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [newBalance, setNewBalance] = useState<string>("")
  const [libraryContent, setLibraryContent] = useState<LibraryItem[]>([])
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState<"folder" | "file">("folder")
  const [newItemContent, setNewItemContent] = useState("")
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [upgradeCategories, setUpgradeCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [newUpgrade, setNewUpgrade] = useState<Upgrade>({ name: "", attributes: {} })
  const [categoryUpgrades, setCategoryUpgrades] = useState<Upgrade[]>([])
  const [userTechPoints, setUserTechPoints] = useState<number>(0)
  const [techPointsToAdd, setTechPointsToAdd] = useState<number>(0)
  const [editingUpgrade, setEditingUpgrade] = useState<Upgrade | null>(null)
  const [missionTitle, setMissionTitle] = useState("")
  const [missionDescription, setMissionDescription] = useState("")
  const [missionDifficulty, setMissionDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy")
  const [missionReward, setMissionReward] = useState(0)
  const [missionBriefing, setMissionBriefing] = useState("")
  const [missionAssignedBy, setMissionAssignedBy] = useState("")
  const [shipSystems, setShipSystems] = useState<ShipSystem[]>([
    { name: "Engines", status: true },
    { name: "Weapons", status: false },
    { name: "Shields", status: true },
    { name: "Life Support", status: true },
    { name: "Warp Drive", status: false },
    { name: "Auspex Array", status: true },
    { name: "Vox-casters", status: true },
    { name: "Gellar Field", status: true },
  ])
  const [shipFuel, setShipFuel] = useState(75)
  const [shipWarpFuel, setShipWarpFuel] = useState(50)
  const [marketItems, setMarketItems] = useState<MarketItem[]>([])
  const [newItem, setNewItem] = useState<MarketItem>({
    id: "",
    name: "",
    type: "weapon",
    description: "",
    price: 0,
    isShown: true,
  })

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const result = await getUsers()
      if (result.success && result.users) {
        setUsers(result.users)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch users.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching users.",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        const result = await deleteUser(userId)
        if (result.success) {
          toast({
            title: "User Deleted",
            description: `User "${username}" has been successfully deleted.`,
          })
          fetchUsers() // Refresh the user list
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete user.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting user.",
          variant: "destructive",
        })
      }
    }
  }

  const fetchMissions = async () => {
    setLoadingMissions(true)
    try {
      const result = await getMissions()
      if (result.success && result.missions) {
        setMissions(result.missions)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch missions.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching missions:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching missions.",
        variant: "destructive",
      })
    } finally {
      setLoadingMissions(false)
    }
  }

  const handleCreateMission = async () => {
    if (!newMissionTitle || !newMissionDescription || newMissionReward <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all mission details and ensure reward is positive.",
        variant: "destructive",
      })
      return
    }

    const missionData: Omit<Mission, "id" | "status"> = {
      title: newMissionTitle,
      description: newMissionDescription,
      rewardCredits: newMissionReward,
    }

    try {
      const result = await createMission(missionData)
      if (result.success && result.mission) {
        setNewMissionTitle("")
        setNewMissionDescription("")
        setNewMissionReward(0)
        toast({
          title: "Mission Created",
          description: `Mission "${result.mission.title}" has been successfully created.`,
        })
        fetchMissions() // Refresh the mission list
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create mission.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating mission:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating mission.",
        variant: "destructive",
      })
    }
  }

  const handleToggleMissionStatus = async (missionId: string, currentStatus: Mission["status"]) => {
    const newStatus = currentStatus === "active" ? "completed" : "active"
    try {
      const result = await toggleMissionStatus(missionId, newStatus)
      if (result.success && result.mission) {
        toast({
          title: "Mission Updated",
          description: `Mission "${result.mission.title}" status updated to ${newStatus}.`,
        })
        fetchMissions() // Refresh the mission list
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update mission status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling mission status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating mission status.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchMissions()
  }, [])

  useEffect(() => {
    const fetchLibraryContent = async () => {
      const content = await getLibraryContent()
      setLibraryContent(content)
    }
    const fetchUpgradeCategories = async () => {
      const categories = await getUpgradeCategories()
      setUpgradeCategories(categories)
    }
    fetchLibraryContent()
    fetchUpgradeCategories()
    fetchMarketItems()
  }, [])

  const getCurrentFolder = () => {
    return libraryContent.filter((item) => JSON.stringify(item.path) === JSON.stringify(currentPath))
  }

  const handleLibraryNavigation = (folder: string) => {
    if (folder === "..") {
      setCurrentPath(currentPath.slice(0, -1))
    } else {
      setCurrentPath([...currentPath, folder])
    }
  }

  const handleUserSelect = async (username: string) => {
    setSelectedUser(username)
    try {
      const data = await getUserData(username)
      setUserData(data)
      const techPoints = await getUserTechPoints(username)
      setUserTechPoints(techPoints)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      })
    }
  }

  const handleBalanceUpdate = async () => {
    if (!selectedUser || !newBalance) return
    try {
      const updatedBalance = await updateUserBalance(selectedUser, Number(newBalance))
      setUserData({ ...userData, balance: updatedBalance })
      toast({
        title: "Success",
        description: "User balance updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user balance",
        variant: "destructive",
      })
    }
  }

  const handleAttributeUpdate = async (attribute: string, value: number) => {
    if (!selectedUser || !userData.characterSheet) return
    try {
      const updatedSheet: CharacterSheet = {
        ...userData.characterSheet,
        attributes: {
          ...userData.characterSheet.attributes,
          [attribute]: {
            ...userData.characterSheet.attributes[attribute],
            rating: value,
          },
        },
      }
      await updateUserCharacterSheet(selectedUser, updatedSheet)
      setUserData({ ...userData, characterSheet: updatedSheet })
      toast({
        title: "Success",
        description: `${attribute} updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${attribute}`,
        variant: "destructive",
      })
    }
  }

  const handleAddItem = async () => {
    if (!newItemName) return

    const newItem: LibraryItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      content: newItemType === "file" ? newItemContent : undefined,
      path: currentPath,
    }

    try {
      const success = await addLibraryItem(newItem)
      if (success) {
        setLibraryContent([...libraryContent, newItem])
        setNewItemName("")
        setNewItemContent("")
        toast({
          title: "Success",
          description: `${newItemType === "folder" ? "Folder" : "File"} added successfully`,
        })
      } else {
        throw new Error("Failed to add item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to the library",
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory) return
    try {
      await addUpgradeCategory(newCategory)
      setUpgradeCategories([...upgradeCategories, newCategory])
      setNewCategory("")
      toast({
        title: "Success",
        description: "Upgrade category added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add upgrade category",
        variant: "destructive",
      })
    }
  }

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category)
    try {
      const upgrades = await getUpgrades(category)
      setCategoryUpgrades(upgrades)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch upgrades for category",
        variant: "destructive",
      })
    }
  }

  const handleAddUpgrade = async () => {
    if (!selectedCategory || !newUpgrade.name) return
    try {
      const upgradeWithCost = {
        ...newUpgrade,
        techPointCost: Number(newUpgrade.techPointCost) || 0,
      }
      await addUpgrade(selectedCategory, upgradeWithCost)
      setCategoryUpgrades([...categoryUpgrades, upgradeWithCost])
      setNewUpgrade({ name: "", attributes: {}, techPointCost: 0 })
      toast({
        title: "Success",
        description: "Upgrade added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add upgrade",
        variant: "destructive",
      })
    }
  }

  const handleAssignUpgrade = async (upgradeName: string) => {
    if (!selectedUser || !selectedCategory) return
    try {
      await assignUpgradeToUser(selectedUser, selectedCategory, upgradeName)
      const updatedUserData = await getUserData(selectedUser)
      setUserData(updatedUserData)
      toast({
        title: "Success",
        description: "Upgrade assigned to user successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign upgrade to user",
        variant: "destructive",
      })
    }
  }

  const handleTechPointUpdate = async () => {
    if (!selectedUser) return
    try {
      const updatedPoints = await updateUserTechPoints(selectedUser, techPointsToAdd)
      setUserTechPoints(updatedPoints)
      setTechPointsToAdd(0)
      toast({
        title: "Success",
        description: "User tech points updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user tech points",
        variant: "destructive",
      })
    }
  }

  const handleRemoveUpgrade = async (username: string, category: string, upgradeName: string) => {
    if (!selectedUser) return
    try {
      console.log(`Attempting to remove upgrade: ${upgradeName} from category: ${category} for user: ${username}`)
      const result = await removeUpgradeFromUser(username, category, upgradeName)
      console.log("Remove upgrade result:", result)

      if (result.success) {
        const updatedUserData = await getUserData(username)
        setUserData(updatedUserData)
        toast({
          title: "Success",
          description: result.message || "Upgrade removed successfully",
        })
      } else {
        throw new Error(result.message || "Failed to remove upgrade")
      }
    } catch (error) {
      console.error("Error removing upgrade:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while removing the upgrade",
        variant: "destructive",
      })
    }
  }

  const handleEditUpgrade = async (category: string, upgradeName: string) => {
    if (!selectedCategory) return
    try {
      const success = await editUpgrade(category, upgradeName, editingUpgrade!)
      if (success) {
        const updatedUpgrades = await getUpgrades(selectedCategory)
        setCategoryUpgrades(updatedUpgrades)
        setEditingUpgrade(null)
        toast({
          title: "Success",
          description: "Upgrade edited successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to edit upgrade",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error editing upgrade:", error)
      toast({
        title: "Error",
        description: "An error occurred while editing the upgrade",
        variant: "destructive",
      })
    }
  }

  const handleCleanUpgradesDatabase = async () => {
    try {
      const result = await cleanUpgradesDatabase()
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // Refresh upgrade categories and clear selected category
        const categories = await getUpgradeCategories()
        setUpgradeCategories(categories)
        setSelectedCategory(null)
        setCategoryUpgrades([])
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error cleaning upgrades database:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred while cleaning the upgrades database",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLibraryItem = async (id: string) => {
    try {
      const success = await deleteLibraryItem(id)
      if (success) {
        setLibraryContent(libraryContent.filter((item) => item.id !== id))
        toast({
          title: "Success",
          description: "Library item deleted successfully",
        })
      } else {
        throw new Error("Failed to delete library item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete library item",
        variant: "destructive",
      })
    }
  }

  const toggleShipSystem = (index: number) => {
    const newSystems = [...shipSystems]
    newSystems[index].status = !newSystems[index].status
    setShipSystems(newSystems)
    // Here you would typically update the backend
  }

  const fetchMarketItems = async () => {
    try {
      const response = await fetch("/api/market/all")
      if (response.ok) {
        const data = await response.json()
        setMarketItems(data)
      } else {
        throw new Error("Failed to fetch market items")
      }
    } catch (error) {
      console.error("Error fetching market items:", error)
      toast({
        title: "Error",
        description: "Failed to load market items",
        variant: "destructive",
      })
    }
  }

  const handleAddMarketItem = async () => {
    try {
      const response = await fetch("/api/market", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const addedItem = await response.json()
      toast({
        title: "Success",
        description: "Market item added successfully",
      })
      setMarketItems([...marketItems, addedItem])
      setNewItem({
        id: "",
        name: "",
        type: "weapon",
        description: "",
        price: 0,
        isShown: true,
      })
    } catch (error) {
      console.error("Error adding market item:", error)
      toast({
        title: "Error",
        description: "Failed to add market item",
        variant: "destructive",
      })
    }
  }

  const handleToggleItemVisibility = async (itemId: string) => {
    try {
      const response = await fetch(`/api/market/${itemId}/toggle`, {
        method: "PUT",
      })

      if (response.ok) {
        fetchMarketItems()
      } else {
        throw new Error("Failed to toggle item visibility")
      }
    } catch (error) {
      console.error("Error toggling item visibility:", error)
      toast({
        title: "Error",
        description: "Failed to toggle item visibility",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="admin-panel-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-6 text-center">Admin Panel</h2>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-darker-bg border border-neon rounded-md overflow-hidden">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-neon data-[state=active]:text-dark-bg text-neon hover:bg-neon/20"
          >
            <Icons.users className="mr-2 h-4 w-4" /> User Management
          </TabsTrigger>
          <TabsTrigger
            value="missions"
            className="data-[state=active]:bg-neon data-[state=active]:text-dark-bg text-neon hover:bg-neon/20"
          >
            <Icons.scrollText className="mr-2 h-4 w-4" /> Mission Control
          </TabsTrigger>
          <TabsTrigger value="library" className="admin-tab">
            LIBRARY
          </TabsTrigger>
          <TabsTrigger value="upgrades" className="admin-tab">
            UPGRADES
          </TabsTrigger>
          <TabsTrigger value="ship-control" className="admin-tab">
            SHIP CONTROL
          </TabsTrigger>
          <TabsTrigger value="market" className="admin-tab">
            MARKET
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="admin-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-neon text-xl">User List</h3>
              <AddUserDialog onUserAdded={fetchUsers} />
            </div>
            {loadingUsers ? (
              <p className="text-center text-neon">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground">No users found.</p>
            ) : (
              <ScrollArea className="h-[400px] w-full rounded-md border border-neon">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="btn-cyberpunk bg-accent-red hover:bg-red-700"
                          >
                            <Icons.x className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        <TabsContent value="missions" className="mt-6">
          <div className="admin-section mb-8">
            <h3 className="text-neon text-xl mb-4">Create New Mission</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Mission Title"
                value={newMissionTitle}
                onChange={(e) => setNewMissionTitle(e.target.value)}
                className="input-cyberpunk"
              />
              <Textarea
                placeholder="Mission Description"
                value={newMissionDescription}
                onChange={(e) => setNewMissionDescription(e.target.value)}
                className="input-cyberpunk min-h-[80px]"
              />
              <Input
                type="number"
                placeholder="Reward Credits"
                value={newMissionReward === 0 ? "" : newMissionReward}
                onChange={(e) => setNewMissionReward(Number.parseInt(e.target.value) || 0)}
                className="input-cyberpunk"
              />
              <Button onClick={handleCreateMission} className="btn-cyberpunk">
                <Icons.plus className="mr-2 h-5 w-5" /> Create Mission
              </Button>
            </div>
          </div>

          <div className="admin-section">
            <h3 className="text-neon text-xl mb-4">Mission List</h3>
            {loadingMissions ? (
              <p className="text-center text-neon">Loading missions...</p>
            ) : missions.length === 0 ? (
              <p className="text-center text-muted-foreground">No missions found.</p>
            ) : (
              <ScrollArea className="h-[400px] w-full rounded-md border border-neon">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Reward</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((mission) => (
                      <tr key={mission.id}>
                        <td>{mission.id}</td>
                        <td>{mission.title}</td>
                        <td>{mission.rewardCredits} ℣</td>
                        <td>
                          <span className={mission.status === "active" ? "text-yellow-500" : "text-green-500"}>
                            {mission.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <Button
                            onClick={() => handleToggleMissionStatus(mission.id, mission.status)}
                            className={`btn-cyberpunk ${mission.status === "active" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}
                          >
                            <Icons.check className="mr-2 h-4 w-4" />{" "}
                            {mission.status === "active" ? "Mark Completed" : "Mark Active"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        <TabsContent value="library" className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Library Management</h2>
            </div>
            <div className="admin-section-content">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Current Path: /{currentPath.join("/")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPath.length > 0 && (
                    <div
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-primary hover:bg-opacity-10"
                      onClick={() => handleLibraryNavigation("..")}
                    >
                      <Folder className="w-6 h-6 mr-2" />
                      <span>..</span>
                    </div>
                  )}
                  {getCurrentFolder().map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-primary hover:bg-opacity-10"
                    >
                      <div
                        className="flex items-center flex-grow"
                        onClick={() => item.type === "folder" && handleLibraryNavigation(item.name)}
                      >
                        {item.type === "folder" ? (
                          <Folder className="w-6 h-6 mr-2" />
                        ) : (
                          <File className="w-6 h-6 mr-2" />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <Button
                        onClick={() => handleDeleteLibraryItem(item.id)}
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="New item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="admin-input"
                />
                <select
                  className="w-full p-2 border rounded admin-input"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as "folder" | "file")}
                >
                  <option value="folder">Folder</option>
                  <option value="file">File</option>
                </select>
                {newItemType === "file" && (
                  <textarea
                    className="w-full p-2 border rounded admin-input min-h-[200px]"
                    placeholder="File content"
                    value={newItemContent}
                    onChange={(e) => setNewItemContent(e.target.value)}
                    rows={10}
                  />
                )}
                <Button onClick={handleAddItem} className="admin-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {newItemType === "folder" ? "Folder" : "File"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upgrades" className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-section-title">Upgrade Management</h2>
                <Button onClick={handleCleanUpgradesDatabase} variant="destructive" className="admin-button">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clean Upgrades Database
                </Button>
              </div>
            </div>
            <div className="admin-section-content">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Add New Category</h3>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="admin-input"
                    />
                    <Button onClick={handleAddCategory} className="admin-button">
                      Add Category
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Manage Upgrades</h3>
                  <select
                    className="w-full p-2 border rounded admin-input mb-2"
                    value={selectedCategory || ""}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {upgradeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <div className="space-y-2">
                      <Input
                        placeholder="New upgrade name"
                        value={newUpgrade.name}
                        onChange={(e) => setNewUpgrade({ ...newUpgrade, name: e.target.value })}
                        className="admin-input"
                      />
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Attribute name"
                          value={Object.keys(newUpgrade.attributes)[0] || ""}
                          onChange={(e) => {
                            const [oldKey] = Object.keys(newUpgrade.attributes)
                            const newKey = e.target.value
                            setNewUpgrade({
                              ...newUpgrade,
                              attributes: {
                                [newKey]: newUpgrade.attributes[oldKey] || 0,
                              },
                            })
                          }}
                          className="admin-input"
                        />
                        <Input
                          type="number"
                          placeholder="Attribute value"
                          value={Object.values(newUpgrade.attributes)[0] || ""}
                          onChange={(e) => {
                            const [key] = Object.keys(newUpgrade.attributes)
                            setNewUpgrade({
                              ...newUpgrade,
                              attributes: {
                                [key]: Number(e.target.value),
                              },
                            })
                          }}
                          className="admin-input"
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Tech Point Cost"
                        value={newUpgrade.techPointCost || ""}
                        onChange={(e) => setNewUpgrade({ ...newUpgrade, techPointCost: Number(e.target.value) })}
                        className="admin-input"
                      />
                      <Button onClick={handleAddUpgrade} className="admin-button">
                        Add Upgrade
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Existing Upgrades</h3>
                  {categoryUpgrades.map((upgrade, index) => (
                    <div
                      key={`${selectedCategory}-${upgrade.name}-${index}`}
                      className="flex items-center justify-between border-b py-2"
                    >
                      <span>
                        {upgrade.name} -
                        {Object.entries(upgrade.attributes)
                          .map(([attr, value]) => `${attr}: ${value}`)
                          .join(", ")}{" "}
                        - Cost: {upgrade.techPointCost} TP
                      </span>
                      <div>
                        {selectedUser && (
                          <Button onClick={() => handleAssignUpgrade(upgrade.name)} className="admin-button mr-2">
                            Assign to {selectedUser}
                          </Button>
                        )}
                        <Button onClick={() => setEditingUpgrade(upgrade)} className="admin-button mr-2">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {selectedUser && (
                          <Button
                            onClick={() => handleRemoveUpgrade(selectedUser, selectedCategory!, upgrade.name)}
                            variant="destructive"
                            className="admin-button"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {editingUpgrade && (
                  <div className="mt-4 p-4 border rounded">
                    <h4 className="text-lg font-semibold mb-2">Edit Upgrade</h4>
                    <Input
                      placeholder="Upgrade name"
                      value={editingUpgrade.name}
                      onChange={(e) => setEditingUpgrade({ ...editingUpgrade, name: e.target.value })}
                      className="admin-input mb-2"
                    />
                    {Object.entries(editingUpgrade.attributes).map(([attr, value]) => (
                      <div key={attr} className="flex space-x-2 mb-2">
                        <Input
                          placeholder="Attribute name"
                          value={attr}
                          onChange={(e) => {
                            const newAttributes = { ...editingUpgrade.attributes }
                            delete newAttributes[attr]
                            newAttributes[e.target.value] = value
                            setEditingUpgrade({ ...editingUpgrade, attributes: newAttributes })
                          }}
                          className="admin-input"
                        />
                        <Input
                          type="number"
                          placeholder="Attribute value"
                          value={value}
                          onChange={(e) =>
                            setEditingUpgrade({
                              ...editingUpgrade,
                              attributes: { ...editingUpgrade.attributes, [attr]: Number(e.target.value) },
                            })
                          }
                          className="admin-input"
                        />
                      </div>
                    ))}
                    <Input
                      type="number"
                      placeholder="Tech Point Cost"
                      value={editingUpgrade.techPointCost}
                      onChange={(e) => setEditingUpgrade({ ...editingUpgrade, techPointCost: Number(e.target.value) })}
                      className="admin-input mb-2"
                    />
                    <Button
                      onClick={() => handleEditUpgrade(selectedCategory!, editingUpgrade.name)}
                      className="admin-button"
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditingUpgrade(null)} variant="outline" className="admin-button ml-2">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ship-control" className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Ship Systems Control</h2>
            </div>
            <div className="admin-section-content">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {shipSystems.map((system, index) => (
                  <div key={system.name} className="flex items-center justify-between">
                    <span>{system.name}</span>
                    <Toggle
                      pressed={system.status}
                      onPressedChange={() => toggleShipSystem(index)}
                      aria-label={`Toggle ${system.name}`}
                    >
                      {system.status ? "Online" : "Offline"}
                    </Toggle>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Promethium Fuel Reserves</label>
                  <Slider value={[shipFuel]} onValueChange={(values) => setShipFuel(values[0])} max={100} step={1} />
                  <span>{shipFuel}%</span>
                </div>
                <div>
                  <label className="block mb-2">Warp Fuel Reserves</label>
                  <Slider
                    value={[shipWarpFuel]}
                    onValueChange={(values) => setShipWarpFuel(values[0])}
                    max={100}
                    step={1}
                  />
                  <span>{shipWarpFuel}%</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="market" className="admin-content">
          <div className="admin-section">
            <h2 className="admin-section-title">Market Management</h2>
            <div className="market-item-form">
              <Input
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as "weapon" | "armor" | "equipment" })}
              >
                <option value="weapon">Weapon</option>
                <option value="armor">Armor</option>
                <option value="equipment">Equipment</option>
              </select>
              <Input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
              />
              {newItem.type === "weapon" && (
                <Input
                  placeholder="Damage (e.g., 1d20)"
                  value={newItem.damage || ""}
                  onChange={(e) => setNewItem({ ...newItem, damage: e.target.value })}
                />
              )}
              {newItem.type === "armor" && (
                <Input
                  type="number"
                  placeholder="Armor Class"
                  value={newItem.armorClass || ""}
                  onChange={(e) => setNewItem({ ...newItem, armorClass: Number(e.target.value) })}
                />
              )}
              {newItem.type === "equipment" && (
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity || ""}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                />
              )}
              <Button onClick={handleAddMarketItem}>Add Item</Button>
            </div>
            <div className="market-items-list">
              {marketItems.map((item) => (
                <div key={item.id} className="market-item">
                  <span>{item.name}</span>
                  <span>{item.type}</span>
                  <span>{item.price} credits</span>
                  <Button onClick={() => handleToggleItemVisibility(item.id)}>{item.isShown ? "Hide" : "Show"}</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
