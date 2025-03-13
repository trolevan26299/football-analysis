"use client";

import React from "react";
import { Box, useTheme } from "@mui/material";

interface DataPoint {
  value: number;
  label?: string;
}

interface StatChartProps {
  data: DataPoint[];
  type: "line" | "bar" | "area";
  height?: number;
  width?: string | number;
  color?: string;
  fillOpacity?: number;
  showTooltip?: boolean;
  animate?: boolean;
}

/**
 * Lightweight chart component for stat cards
 */
export default function StatChart({
  data,
  type = "line",
  height = 40,
  width = "100%",
  color,
  fillOpacity = 0.2,
  animate = true,
  showTooltip = false,
}: StatChartProps) {
  const theme = useTheme();
  const chartColor = color || theme.palette.primary.main;

  // Calculate min and max values for scaling
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Avoid division by zero

  // Scale values between 0 and 1
  const scaled = values.map((v) => (v - min) / range);

  // Create points for SVG path
  const totalPoints = data.length;
  const pointWidth = 100 / (totalPoints - 1 || 1); // Avoid division by zero

  const points = scaled.map((value, index) => ({
    x: index * pointWidth,
    y: 100 - value * 100, // Invert y-axis (SVG 0,0 is top-left)
  }));

  // Create SVG path
  const linePath = points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  // Create area path (for area chart)
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} 100 L 0 100 Z`;

  // Create bar chart
  const renderBars = () => {
    const barWidth = 100 / (totalPoints + 1);
    const padding = barWidth * 0.2;

    return points.map((point, i) => (
      <rect
        key={i}
        x={i * pointWidth - barWidth / 2 + padding / 2}
        y={point.y}
        width={barWidth - padding}
        height={100 - point.y}
        fill={chartColor}
        opacity={0.8}
        rx={1}
        className={animate ? "animate-bar" : ""}
        style={{
          animationDelay: `${i * 50}ms`,
        }}
      />
    ));
  };

  return (
    <Box
      sx={{
        height,
        width,
        position: "relative",
        ".animate-line": {
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: animate ? "dash 1s ease-in-out forwards" : "none",
          "@keyframes dash": {
            to: {
              strokeDashoffset: 0,
            },
          },
        },
        ".animate-area": {
          opacity: 0,
          animation: animate ? "fadeIn 0.5s ease-in-out 0.5s forwards" : "none",
          "@keyframes fadeIn": {
            to: {
              opacity: fillOpacity,
            },
          },
        },
        ".animate-bar": {
          transformOrigin: "bottom",
          transform: "scaleY(0)",
          animation: animate ? "growBar 0.5s ease-out forwards" : "none",
          "@keyframes growBar": {
            to: {
              transform: "scaleY(1)",
            },
          },
        },
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: "block" }}>
        {/* Chart background grid (optional) */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#ccc" strokeWidth="0.2" strokeDasharray="1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#ccc" strokeWidth="0.2" strokeDasharray="1" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#ccc" strokeWidth="0.2" strokeDasharray="1" />

        {/* Draw the appropriate chart type */}
        {type === "bar" ? (
          renderBars()
        ) : (
          <>
            {/* Area fill */}
            {type === "area" && <path d={areaPath} fill={chartColor} opacity={0} className="animate-area" />}

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={chartColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-line"
            />

            {/* Data points */}
            {showTooltip &&
              points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill={theme.palette.background.paper}
                  stroke={chartColor}
                  strokeWidth="1"
                  data-value={data[i].value}
                  data-label={data[i].label}
                />
              ))}
          </>
        )}
      </svg>
    </Box>
  );
}
