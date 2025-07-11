import React from 'react';

interface CustomKnobProps {
  value: number;
  min: number;
  max: number;
  size: number;
  color: string;
  backgroundColor: string;
  label: string;
}

const CustomKnob: React.FC<CustomKnobProps> = ({
  value,
  min,
  max,
  size,
  color,
  backgroundColor,
  label
}) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value - min) / (max - min);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="custom-knob">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.2}
        >
          {Math.round(value)}%
        </text>
      </svg>
      <div className="knob-label" style={{ color: color }}>{label}</div>
    </div>
  );
};

export default CustomKnob;
