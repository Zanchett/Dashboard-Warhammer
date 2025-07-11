import React, { useState, useEffect } from 'react';
import { Toggle } from "@/components/ui/toggle"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"

interface ShipSystem {
  name: string;
  status: boolean;
}

const ShipControl: React.FC = () => {
  const [systems, setSystems] = useState<ShipSystem[]>([
    { name: 'Engines', status: true },
    { name: 'Weapons', status: false },
    { name: 'Shields', status: true },
    { name: 'Life Support', status: true },
    { name: 'Warp Drive', status: false },
    { name: 'Auspex Array', status: true },
    { name: 'Vox-casters', status: true },
    { name: 'Gellar Field', status: true },
  ]);
  const [fuel, setFuel] = useState(75);
  const [warpFuel, setWarpFuel] = useState(50);

  const toggleSystem = (index: number) => {
    const newSystems = [...systems];
    newSystems[index].status = !newSystems[index].status;
    setSystems(newSystems);
  };

  useEffect(() => {
    // Here you would typically fetch the initial state from your backend
    // For now, we'll just use the default state set in useState
  }, []);

  return (
    <div className="ship-control">
      <h2 className="text-2xl font-bold mb-4">Ship Control Interface</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {systems.map((system, index) => (
          <div key={system.name} className="flex items-center justify-between">
            <span>{system.name}</span>
            <Toggle
              pressed={system.status}
              onPressedChange={() => toggleSystem(index)}
              aria-label={`Toggle ${system.name}`}
            >
              {system.status ? 'Online' : 'Offline'}
            </Toggle>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Promethium Fuel Reserves</label>
          <Progress value={fuel} className="w-full" />
          <Slider
            value={[fuel]}
            onValueChange={(values) => setFuel(values[0])}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <label className="block mb-2">Warp Fuel Reserves</label>
          <Progress value={warpFuel} className="w-full" />
          <Slider
            value={[warpFuel]}
            onValueChange={(values) => setWarpFuel(values[0])}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default ShipControl;
