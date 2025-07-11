"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DataPoint {
  name: string
  fluctuation: number
}

const generateWarpData = (count: number): DataPoint[] => {
  const data: DataPoint[] = []
  for (let i = 0; i < count; i++) {
    data.push({
      name: `T-${count - i}`,
      fluctuation: Math.random() * 100, // Random fluctuation between 0 and 100
    })
  }
  return data
}

export default function WarpFluctuationGraph() {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    // Initial data load
    setData(generateWarpData(20))

    // Update data every few seconds to simulate real-time fluctuations
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1), { name: `T-0`, fluctuation: Math.random() * 100 }]
        // Update names to reflect new time window
        return newData.map((point, index) => ({ ...point, name: `T-${newData.length - 1 - index}` }))
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="panel-cyberpunk p-4">
      <h3 className="text-neon text-lg mb-4">Warp Fluctuation Monitor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff00" opacity={0.3} />
          <XAxis dataKey="name" stroke="#00ff00" />
          <YAxis stroke="#00ff00" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #00ff00", color: "#00ff00" }}
            labelStyle={{ color: "#00ff00" }}
          />
          <Line type="monotone" dataKey="fluctuation" stroke="#00ff00" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-center mt-2">
        Current Fluctuation: {data.length > 0 ? data[data.length - 1].fluctuation.toFixed(2) : "N/A"}%
      </p>
    </div>
  )
}
