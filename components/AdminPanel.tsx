'use client'

import React, { useState, useEffect } from 'react';
import { getAllUsers, getUserData, updateUserBalance, updateUserCharacterSheet, addUpgradeCategory, getUpgradeCategories, addUpgrade, getUpgrades, assignUpgradeToUser, getUserUpgrades, Upgrade, UserUpgrades, removeUpgradeFromUser, editUpgrade, cleanUpgradesDatabase } from '@/app/actions/admin';
import { getUserTechPoints, updateUserTechPoints } from '@/app/actions/admin';
import { CharacterSheet } from '@/types/character-sheet';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, Plus, Edit, Trash, RefreshCw } from 'lucide-react';
import { getLibraryContent, addLibraryItem, LibraryItem, deleteLibraryItem } from '@/app/actions/library';
import { Mission } from '@/types/missions';
import { Trash2 } from 'lucide-react';


const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [newBalance, setNewBalance] = useState<string>('');
  const { toast } = useToast();
  const [libraryContent, setLibraryContent] = useState<LibraryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'folder' | 'file'>('folder');
  const [newItemContent, setNewItemContent] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [upgradeCategories, setUpgradeCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newUpgrade, setNewUpgrade] = useState<Upgrade>({ name: '', attributes: {} });
  const [categoryUpgrades, setCategoryUpgrades] = useState<Upgrade[]>([]);
  const [userTechPoints, setUserTechPoints] = useState<number>(0);
  const [techPointsToAdd, setTechPointsToAdd] = useState<number>(0);
  const [editingUpgrade, setEditingUpgrade] = useState<Upgrade | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionDifficulty, setMissionDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [missionReward, setMissionReward] = useState(0);
  const [missionBriefing, setMissionBriefing] = useState('');
  const [missionAssignedBy, setMissionAssignedBy] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    };
    const fetchLibraryContent = async () => {
      const content = await getLibraryContent();
      setLibraryContent(content);
    };
    const fetchUpgradeCategories = async () => {
      const categories = await getUpgradeCategories();
      setUpgradeCategories(categories);
    };
    fetchUsers();
    fetchLibraryContent();
    fetchUpgradeCategories();
    fetchMissions();
  }, []);

  const getCurrentFolder = () => {
    return libraryContent.filter(item => JSON.stringify(item.path) === JSON.stringify(currentPath));
  };

  const handleLibraryNavigation = (folder: string) => {
    if (folder === '..') {
      setCurrentPath(currentPath.slice(0, -1));
    } else {
      setCurrentPath([...currentPath, folder]);
    }
  };

  const handleUserSelect = async (username: string) => {
    setSelectedUser(username);
    try {
      const data = await getUserData(username);
      setUserData(data);
      const techPoints = await getUserTechPoints(username);
      setUserTechPoints(techPoints);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    }
  };

  const handleBalanceUpdate = async () => {
    if (!selectedUser || !newBalance) return;
    try {
      const updatedBalance = await updateUserBalance(selectedUser, Number(newBalance));
      setUserData({ ...userData, balance: updatedBalance });
      toast({
        title: "Success",
        description: "User balance updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user balance",
        variant: "destructive",
      });
    }
  };

  const handleAttributeUpdate = async (attribute: string, value: number) => {
    if (!selectedUser || !userData.characterSheet) return;
    try {
      const updatedSheet: CharacterSheet = {
        ...userData.characterSheet,
        attributes: {
          ...userData.characterSheet.attributes,
          [attribute]: {
            ...userData.characterSheet.attributes[attribute],
            rating: value
          }
        }
      };
      await updateUserCharacterSheet(selectedUser, updatedSheet);
      setUserData({ ...userData, characterSheet: updatedSheet });
      toast({
        title: "Success",
        description: `${attribute} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${attribute}`,
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItemName) return;

    const newItem: LibraryItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      content: newItemType === 'file' ? newItemContent : undefined,
      path: currentPath,
    };

    try {
      const success = await addLibraryItem(newItem);
      if (success) {
        setLibraryContent([...libraryContent, newItem]);
        setNewItemName('');
        setNewItemContent('');
        toast({
          title: "Success",
          description: `${newItemType === 'folder' ? 'Folder' : 'File'} added successfully`,
        });
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to the library",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    try {
      await addUpgradeCategory(newCategory);
      setUpgradeCategories([...upgradeCategories, newCategory]);
      setNewCategory('');
      toast({
        title: "Success",
        description: "Upgrade category added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add upgrade category",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    try {
      const upgrades = await getUpgrades(category);
      setCategoryUpgrades(upgrades);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch upgrades for category",
        variant: "destructive",
      });
    }
  };

  const handleAddUpgrade = async () => {
    if (!selectedCategory || !newUpgrade.name) return;
    try {
      const upgradeWithCost = {
        ...newUpgrade,
        techPointCost: Number(newUpgrade.techPointCost) || 0,
      };
      await addUpgrade(selectedCategory, upgradeWithCost);
      setCategoryUpgrades([...categoryUpgrades, upgradeWithCost]);
      setNewUpgrade({ name: '', attributes: {}, techPointCost: 0 });
      toast({
        title: "Success",
        description: "Upgrade added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add upgrade",
        variant: "destructive",
      });
    }
  };

  const handleAssignUpgrade = async (upgradeName: string) => {
    if (!selectedUser || !selectedCategory) return;
    try {
      await assignUpgradeToUser(selectedUser, selectedCategory, upgradeName);
      const updatedUserData = await getUserData(selectedUser);
      setUserData(updatedUserData);
      toast({
        title: "Success",
        description: "Upgrade assigned to user successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign upgrade to user",
        variant: "destructive",
      });
    }
  };

  const handleTechPointUpdate = async () => {
    if (!selectedUser) return;
    try {
      const updatedPoints = await updateUserTechPoints(selectedUser, techPointsToAdd);
      setUserTechPoints(updatedPoints);
      setTechPointsToAdd(0);
      toast({
        title: "Success",
        description: "User tech points updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user tech points",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUpgrade = async (username: string, category: string, upgradeName: string) => {
    if (!selectedUser) return;
    try {
      console.log(`Attempting to remove upgrade: ${upgradeName} from category: ${category} for user: ${username}`);
      const result = await removeUpgradeFromUser(username, category, upgradeName);
      console.log('Remove upgrade result:', result);
      
      if (result.success) {
        const updatedUserData = await getUserData(username);
        setUserData(updatedUserData);
        toast({
          title: "Success",
          description: result.message || "Upgrade removed successfully",
        });
      } else {
        throw new Error(result.message || 'Failed to remove upgrade');
      }
    } catch (error) {
      console.error('Error removing upgrade:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while removing the upgrade",
        variant: "destructive",
      });
    }
  };

  const handleEditUpgrade = async (category: string, upgradeName: string) => {
    if (!selectedCategory) return;
    try {
      const success = await editUpgrade(category, upgradeName, editingUpgrade!);
      if (success) {
        const updatedUpgrades = await getUpgrades(selectedCategory);
        setCategoryUpgrades(updatedUpgrades);
        setEditingUpgrade(null);
        toast({
          title: "Success",
          description: "Upgrade edited successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to edit upgrade",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error editing upgrade:', error);
      toast({
        title: "Error",
        description: "An error occurred while editing the upgrade",
        variant: "destructive",
      });
    }
  };

  const handleCleanUpgradesDatabase = async () => {
    try {
      const result = await cleanUpgradesDatabase();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh upgrade categories and clear selected category
        const categories = await getUpgradeCategories();
        setUpgradeCategories(categories);
        setSelectedCategory(null);
        setCategoryUpgrades([]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error cleaning upgrades database:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while cleaning the upgrades database",
        variant: "destructive",
      });
    }
  };

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      if (response.ok) {
        const data = await response.json();
        setMissions(data);
      } else {
        throw new Error('Failed to fetch missions');
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch missions",
        variant: "destructive",
      });
    }
  };

  const handleCreateMission = async () => {
    try {
      const newMission: Omit<Mission, 'id' | 'hexCode'> = {
        title: missionTitle,
        description: missionDescription,
        difficulty: missionDifficulty,
        reward: missionReward,
        briefing: missionBriefing,
        assignedBy: missionAssignedBy,
        status: 'AVAILABLE', 
      };

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Mission created successfully",
        });
        fetchMissions();
        resetMissionForm();
      } else {
        throw new Error('Failed to create mission');
      }
    } catch (error) {
      console.error('Error creating mission:', error);
      toast({
        title: "Error",
        description: "Failed to create mission",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMission = async () => {
    if (!selectedMission) return;

    try {
      const updatedMission: Mission = {
        ...selectedMission,
        title: missionTitle,
        description: missionDescription,
        difficulty: missionDifficulty,
        reward: missionReward,
        briefing: missionBriefing,
        assignedBy: missionAssignedBy,
      };

      const response = await fetch(`/api/missions/${selectedMission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMission),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Mission updated successfully",
        });
        fetchMissions();
        resetMissionForm();
      } else {
        throw new Error('Failed to update mission');
      }
    } catch (error) {
      console.error('Error updating mission:', error);
      toast({
        title: "Error",
        description: "Failed to update mission",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMission = async (id: string) => {
    try {
      const response = await fetch(`/api/missions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Mission deleted successfully",
        });
        fetchMissions();
        resetMissionForm();
      } else {
        throw new Error('Failed to delete mission');
      }
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast({
        title: "Error",
        description: "Failed to delete mission",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLibraryItem = async (id: string) => {
    try {
      const success = await deleteLibraryItem(id);
      if (success) {
        setLibraryContent(libraryContent.filter((item) => item.id !== id));
        toast({
          title: 'Success',
          description: 'Library item deleted successfully',
        });
      } else {
        throw new Error('Failed to delete library item');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete library item',
        variant: 'destructive',
      });
    }
  };

  const resetMissionForm = () => {
    setSelectedMission(null);
    setMissionTitle('');
    setMissionDescription('');
    setMissionDifficulty('Easy');
    setMissionReward(0);
    setMissionBriefing('');
    setMissionAssignedBy('');
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">COGITATOR INTERFACE v2.781</h1>
        <div className="admin-status">ACCESS LEVEL: MAGOS</div>
      </div>
      <Tabs defaultValue="users" className="admin-tabs">
        <TabsList className="admin-tabs-list">
          <TabsTrigger value="users" className="admin-tab">USERS</TabsTrigger>
          <TabsTrigger value="library" className="admin-tab">LIBRARY</TabsTrigger>
          <TabsTrigger value="upgrades" className="admin-tab">UPGRADES</TabsTrigger>
          <TabsTrigger value="missions" className="admin-tab">MISSIONS</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="admin-content">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 admin-section bg-background border-primary">
              <div className="admin-section-header">
                <h2 className="admin-section-title text-primary">Users</h2>
              </div>
              <div className="admin-section-content">
                <div className="space-y-2">
                  {users.map(user => (
                    <Button 
                      key={user} 
                      onClick={() => handleUserSelect(user)} 
                      variant={selectedUser === user ? "default" : "outline"}
                      className="admin-button w-full justify-start text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {user}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-3 admin-section bg-background border-primary">
              <div className="admin-section-header">
                <h2 className="admin-section-title text-primary">{selectedUser ? `User Data: ${selectedUser}` : 'Select a user'}</h2>
              </div>
              <div className="admin-section-content">
                {selectedUser && userData ? (
                  <Tabs defaultValue="balance" className="text-primary">
                    <TabsList className="border-b border-primary">
                      <TabsTrigger value="balance" className="data-[state=active]:border-primary data-[state=active]:text-primary">Balance</TabsTrigger>
                      <TabsTrigger value="character" className="data-[state=active]:border-primary data-[state=active]:text-primary">Character Sheet</TabsTrigger>
                      <TabsTrigger value="user-upgrades" className="data-[state=active]:border-primary data-[state=active]:text-primary">Upgrades</TabsTrigger>
                    </TabsList>
                    <TabsContent value="balance">
                      <div className="space-y-4">
                        <div className="text-primary">Current Balance: {userData.balance}</div>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            placeholder="New Balance"
                            className="admin-input bg-background text-primary border-primary"
                          />
                          <Button onClick={handleBalanceUpdate} className="admin-button bg-primary text-primary-foreground hover:bg-primary/80">Update Balance</Button>
                        </div>
                      </div>
                      <div className="space-y-4 mt-4">
                        <div className="text-primary">Current Tech Points: {userTechPoints}</div>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={techPointsToAdd}
                            onChange={(e) => setTechPointsToAdd(Number(e.target.value))}
                            placeholder="Tech points to add/remove"
                            className="admin-input bg-background text-primary border-primary"
                          />
                          <Button onClick={handleTechPointUpdate} className="admin-button bg-primary text-primary-foreground hover:bg-primary/80">
                            Update Tech Points
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="character">
                      {userData.characterSheet ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(userData.characterSheet.attributes).map(([attr, value]: [string, any]) => (
                            <div key={attr} className="flex items-center space-x-2">
                              <span className="text-primary">{attr}: {value.rating}</span>
                              <Input
                                type="number"
                                defaultValue={value.rating}
                                onChange={(e) => handleAttributeUpdate(attr, Number(e.target.value))}
                                className="admin-input w-20 bg-background text-primary border-primary"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-primary">No character sheet data available</div>
                      )}
                    </TabsContent>
                    <TabsContent value="user-upgrades">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">User Upgrades</h3>
                        {Object.entries(userData.upgrades as UserUpgrades).map(([category, upgrades]) => (
                          <div key={category} className="border-t pt-2">
                            <h4 className="font-medium">{category}</h4>
                            <ul className="list-disc list-inside">
                              {upgrades.map((upgrade: Upgrade, index: number) => (
                                <li key={`${category}-${upgrade.name}-${index}`} className="flex items-center justify-between">
                                  <span>
                                    {upgrade.name} - 
                                    {Object.entries(upgrade.attributes).map(([attr, value]) => (
                                      <span key={attr}> {attr}: {value}</span>
                                    ))}
                                  </span>
                                  <Button
                                    onClick={() => handleRemoveUpgrade(selectedUser, category, upgrade.name)}
                                    variant="destructive"
                                    size="sm"
                                    className="admin-button ml-2"
                                  >
                                    <Trash className="w-4 h-4 mr-2" />
                                    Remove
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-primary">Select a user to view and edit their data</div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="admin-content">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Library Management</h2>
            </div>
            <div className="admin-section-content">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Current Path: /{currentPath.join('/')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPath.length > 0 && (
                    <div
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-primary hover:bg-opacity-10"
                      onClick={() => handleLibraryNavigation('..')}
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
                        onClick={() => item.type === 'folder' && handleLibraryNavigation(item.name)}
                      >
                        {item.type === 'folder' ? (
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
                  onChange={(e) => setNewItemType(e.target.value as 'folder' | 'file')}
                >
                  <option value="folder">Folder</option>
                  <option value="file">File</option>
                </select>
                {newItemType === 'file' && (
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
                  Add {newItemType === 'folder' ? 'Folder' : 'File'}
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
                    <Button onClick={handleAddCategory} className="admin-button">Add Category</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Manage Upgrades</h3>
                  <select
                    className="w-full p-2 border rounded admin-input mb-2"
                    value={selectedCategory || ''}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {upgradeCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
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
                          value={Object.keys(newUpgrade.attributes)[0] || ''}
                          onChange={(e) => {
                            const [oldKey] = Object.keys(newUpgrade.attributes);
                            const newKey = e.target.value;
                            setNewUpgrade({
                              ...newUpgrade,
                              attributes: {
                                [newKey]: newUpgrade.attributes[oldKey] || 0
                              }
                            });
                          }}
                          className="admin-input"
                        />
                        <Input
                          type="number"
                          placeholder="Attribute value"
                          value={Object.values(newUpgrade.attributes)[0] || ''}
                          onChange={(e) => {
                            const [key] = Object.keys(newUpgrade.attributes);
                            setNewUpgrade({
                              ...newUpgrade,
                              attributes: {
                                [key]: Number(e.target.value)
                              }
                            });
                          }}
                          className="admin-input"
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Tech Point Cost"
                        value={newUpgrade.techPointCost || ''}
                        onChange={(e) => setNewUpgrade({ ...newUpgrade, techPointCost: Number(e.target.value) })}
                        className="admin-input"
                      />
                      <Button onClick={handleAddUpgrade} className="admin-button">Add Upgrade</Button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Existing Upgrades</h3>
                  {categoryUpgrades.map((upgrade, index) => (
                    <div key={`${selectedCategory}-${upgrade.name}-${index}`} className="flex items-center justify-between border-b py-2">
                      <span>
                        {upgrade.name} - 
                        {Object.entries(upgrade.attributes).map(([attr, value]) => `${attr}: ${value}`).join(', ')} - 
                        Cost: {upgrade.techPointCost} TP
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
                          <Button onClick={() => handleRemoveUpgrade(selectedUser, selectedCategory!, upgrade.name)} variant="destructive" className="admin-button">
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
                            const newAttributes = { ...editingUpgrade.attributes };
                            delete newAttributes[attr];
                            newAttributes[e.target.value] = value;
                            setEditingUpgrade({ ...editingUpgrade, attributes: newAttributes });
                          }}
                          className="admin-input"
                        />
                        <Input
                          type="number"
                          placeholder="Attribute value"
                          value={value}
                          onChange={(e) => setEditingUpgrade({
                            ...editingUpgrade,
                            attributes: { ...editingUpgrade.attributes, [attr]: Number(e.target.value) }
                          })}
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
                    <Button onClick={() => handleEditUpgrade(selectedCategory!, editingUpgrade.name)} className="admin-button">
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

        <TabsContent value="missions" className="admin-content">
          <div className="admin-missions">
            <div className="mission-form">
              <h3 className="section-title">CREATE/EDIT MISSION</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                selectedMission ? handleUpdateMission() : handleCreateMission();
              }}>
                <Input
                  placeholder="MISSION TITLE"
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  className="admin-input"
                />
                <Input
                  placeholder="DESCRIPTION"
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  className="admin-input"
                />
                <select
                  value={missionDifficulty}
                  onChange={(e) => setMissionDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  className="admin-select admin-input"
                >
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                </select>
                <Input
                  type="number"
                  placeholder="REWARD"
                  value={missionReward}
                  onChange={(e) => setMissionReward(Number(e.target.value))}
                  className="admin-input"
                />
                <textarea
                  placeholder="BRIEFING"
                  value={missionBriefing}
                  onChange={(e) => setMissionBriefing(e.target.value)}
                  className="admin-textarea admin-input"
                  rows={4}
                />
                <Input
                  placeholder="ASSIGNED BY"
                  value={missionAssignedBy}
                  onChange={(e) => setMissionAssignedBy(e.target.value)}
                  className="admin-input"
                />
                <Button type="submit" className="admin-button">
                  {selectedMission ? 'UPDATE_MISSION' : 'CREATE_MISSION'}
                </Button>
              </form>
            </div>
            <div className="mission-list">
              <h3 className="section-title">MISSION DATABASE</h3>
              <ScrollArea className="admin-scrollarea">
                {missions.map((mission) => (
                  <div key={mission.id} className="mission-entry">
                    <div className="mission-header">
                      <span className="mission-hexcode">0x{mission.id.toString(16).padStart(4, '0').toUpperCase()}</span>
                      <span className="mission-title">{mission.title}</span>
                    </div>
                    <div className="mission-actions">
                      <Button 
                        onClick={() => {
                          setSelectedMission(mission);
                          setMissionTitle(mission.title);
                          setMissionDescription(mission.description);
                          setMissionDifficulty(mission.difficulty);
                          setMissionReward(mission.reward);
                          setMissionBriefing(mission.briefing);
                          setMissionAssignedBy(mission.assignedBy);
                        }}
                        className="admin-button"
                      >
                        EDIT
                      </Button>
                      <Button 
                        onClick={() => handleDeleteMission(mission.id)}
                        className="admin-button delete"
                      >
                        DELETE
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

