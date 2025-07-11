import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Cog, Cpu, Eye, Zap } from 'lucide-react';
import { getUserUpgrades, UserUpgrades, Upgrade, getUserTechPoints, assignUpgradeToUser, getUpgradeCategories, getUpgrades } from '@/app/actions/admin';
import { useToast } from "@/components/ui/use-toast"

interface MechanicusUpgradesProps {
  username: string;
}

const MechanicusUpgrades: React.FC<MechanicusUpgradesProps> = ({ username }) => {
  const [userUpgrades, setUserUpgrades] = useState<UserUpgrades>({});
  const [availableUpgrades, setAvailableUpgrades] = useState<UserUpgrades>({});
  const [techPoints, setTechPoints] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const upgrades = await getUserUpgrades(username);
        setUserUpgrades(upgrades);
        const points = await getUserTechPoints(username);
        setTechPoints(points);
        
        // Fetch available upgrades
        const categories = await getUpgradeCategories();
        const availableUpgrades: UserUpgrades = {};
        for (const category of categories) {
          const categoryUpgrades = await getUpgrades(category);
          availableUpgrades[category] = categoryUpgrades.filter(upgrade => 
            !upgrades[category] || !upgrades[category].some(userUpgrade => userUpgrade.name === upgrade.name)
          );
        }
        setAvailableUpgrades(availableUpgrades);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  const handleUpgrade = async (category: string, upgradeName: string) => {
    try {
      const success = await assignUpgradeToUser(username, category, upgradeName);
      if (success) {
        await fetchUserData(); // Refetch all data after successful upgrade
        toast({
          title: "Success",
          description: "Upgrade applied successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Not enough tech points for this upgrade",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error applying upgrade:', error);
      toast({
        title: "Error",
        description: "Failed to apply upgrade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderUpgradeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ocular':
        return <Eye className="w-6 h-6" />;
      case 'cogitator':
        return <Cpu className="w-6 h-6" />;
      case 'mechadendrite':
        return <Cog className="w-6 h-6" />;
      case 'power':
        return <Zap className="w-6 h-6" />;
      default:
        return <Cog className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return <div className="text-primary">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mechanicus-upgrades bg-black border border-primary p-4 rounded-lg">
      <h2 className="text-primary text-2xl font-bold mb-4">Mechanicus Upgrades</h2>
      <div className="text-primary mb-4">Tech Points: {techPoints}</div>
      <div className="space-y-4">
        {Object.entries(availableUpgrades).map(([category, upgrades]) => (
          <div key={category} className="bg-secondary bg-opacity-10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {renderUpgradeIcon(category)}
                <span className="text-primary ml-2 font-bold">{category}</span>
              </div>
            </div>
            {upgrades.map((upgrade: Upgrade) => (
              <div key={upgrade.name} className="mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-secondary mb-1">{upgrade.name}</p>
                  <Button 
                    onClick={() => handleUpgrade(category, upgrade.name)}
                    disabled={techPoints < upgrade.techPointCost}
                  >
                    Upgrade ({upgrade.techPointCost} TP)
                  </Button>
                </div>
                {Object.entries(upgrade.attributes).map(([attr, value]) => (
                  <div key={attr} className="flex items-center">
                    <span className="text-primary mr-2 w-24">{attr}:</span>
                    <Progress value={value} max={100} className="flex-grow" />
                    <span className="text-primary ml-2">{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <h3 className="text-primary text-xl font-bold mt-6 mb-4">Current Upgrades</h3>
      <div className="space-y-4">
        {Object.entries(userUpgrades).map(([category, upgrades]) => (
          <div key={category} className="bg-secondary bg-opacity-10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {renderUpgradeIcon(category)}
                <span className="text-primary ml-2 font-bold">{category}</span>
              </div>
            </div>
            {upgrades.map((upgrade: Upgrade) => (
              <div key={upgrade.name} className="mt-2">
                <p className="text-secondary mb-1">{upgrade.name}</p>
                {Object.entries(upgrade.attributes).map(([attr, value]) => (
                  <div key={attr} className="flex items-center">
                    <span className="text-primary mr-2 w-24">{attr}:</span>
                    <Progress value={value} max={100} className="flex-grow" />
                    <span className="text-primary ml-2">{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MechanicusUpgrades;
