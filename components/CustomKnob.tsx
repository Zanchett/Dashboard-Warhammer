"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface CustomKnobProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

const CustomKnob: React.FC<CustomKnobProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  size = 80,
  strokeWidth = 8,
  className,
  label,
}) => {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - ((value - min) / (max - min)) * circumference

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault() // Prevent text selection
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !knobRef.current) return

      const rect = knobRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      let degree = angle * (180 / Math.PI)

      // Adjust angle to be 0-360, starting from the bottom (or 6 o'clock)
      degree = (degree + 270 + 360) % 360

      // Map degree to value range (e.g., 0-360 degrees to 0-100 value)
      // We want the knob to start at 225 degrees (bottom-left) and end at 315 degrees (bottom-right)
      // This gives us a 270 degree range for the knob movement
      const startAngle = 225 // 7 o'clock
      const endAngle = 315 // 5 o'clock (after going through 0/360)

      let normalizedDegree
      if (degree >= startAngle && degree <= 360) {
        normalizedDegree = degree - startAngle
      } else if (degree >= 0 && degree <= endAngle) {
        normalizedDegree = degree + (360 - startAngle)
      } else {
        // If outside the active range, clamp to nearest end
        const distToStart = Math.min(Math.abs(degree - startAngle), Math.abs(degree - (startAngle - 360)))
        const distToEnd = Math.min(Math.abs(degree - endAngle), Math.abs(degree - (endAngle + 360)))
        if (distToStart < distToEnd) {
          normalizedDegree = 0 // Clamp to start
        } else {
          normalizedDegree = 270 // Clamp to end (full range)
        }
      }

      const maxDegreeRange = 270 // Total degrees of movement
      const newValue = Math.round(((normalizedDegree / maxDegreeRange) * (max - min)) / step) * step + min

      onChange(Math.max(min, Math.min(max, newValue)))
    },
    [isDragging, min, max, step, onChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Calculate rotation for the indicator line
  const indicatorAngle = ((value - min) / (max - min)) * 270 - 135 // -135 to start from bottom-left and sweep clockwise

  return (
    <div
      ref={knobRef}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full border-2 border-neon bg-darker-bg shadow-neon-glow cursor-pointer",
        className,
      )}
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        <circle
          className="text-dark-bg"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-neon"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-135 ${size / 2} ${size / 2})`} // Start from bottom-left
        />
      </svg>
      <div
        className="absolute w-1 h-1/3 bg-neon rounded-full origin-bottom"
        style={{
          transform: `translateY(-${radius / 2}px) rotate(${indicatorAngle}deg)`,
          transformOrigin: "bottom center",
          boxShadow: "0 0 5px var(--neon-green)",
        }}
      />
      <span className="text-neon text-lg font-bold z-10">{value}</span>
      {label && <span className="absolute -bottom-6 text-sm text-neon">{label}</span>}
    </div>
  )
}

export default CustomKnob
