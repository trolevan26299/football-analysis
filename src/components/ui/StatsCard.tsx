"use client";

import React from "react";
import { Box, Paper, Typography, Fade, useTheme, Tooltip, Zoom } from "@mui/material";
import StatChart from "./StatChart";

export type StatCardColor = "primary" | "secondary" | "success" | "error" | "warning" | "info" | "dark" | "light";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trendValue?: number;
  trendLabel?: string;
  color?: StatCardColor;
  chartData?: Array<{ value: number; label?: string }>;
  chartType?: "line" | "bar" | "area";
  onClick?: () => void;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  icon,
  subtitle,
  trendValue,
  trendLabel,
  color = "primary",
  chartData,
  chartType = "line",
  onClick,
  delay = 0,
}: StatsCardProps) {
  const theme = useTheme();

  // Define color set based on the color prop
  const getColorSet = () => {
    switch (color) {
      case "primary":
        return {
          main: theme.palette.primary.main,
          light: theme.palette.primary.light,
          dark: theme.palette.primary.dark,
          contrastText: theme.palette.primary.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}30)`,
        };
      case "secondary":
        return {
          main: theme.palette.secondary.main,
          light: theme.palette.secondary.light,
          dark: theme.palette.secondary.dark,
          contrastText: theme.palette.secondary.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.secondary.light}20, ${theme.palette.secondary.main}30)`,
        };
      case "success":
        return {
          main: theme.palette.success.main,
          light: theme.palette.success.light,
          dark: theme.palette.success.dark,
          contrastText: theme.palette.success.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}30)`,
        };
      case "error":
        return {
          main: theme.palette.error.main,
          light: theme.palette.error.light,
          dark: theme.palette.error.dark,
          contrastText: theme.palette.error.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.error.light}20, ${theme.palette.error.main}30)`,
        };
      case "warning":
        return {
          main: theme.palette.warning.main,
          light: theme.palette.warning.light,
          dark: theme.palette.warning.dark,
          contrastText: theme.palette.warning.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.warning.light}20, ${theme.palette.warning.main}30)`,
        };
      case "info":
        return {
          main: theme.palette.info.main,
          light: theme.palette.info.light,
          dark: theme.palette.info.dark,
          contrastText: theme.palette.info.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.info.light}20, ${theme.palette.info.main}30)`,
        };
      case "dark":
        return {
          main: theme.palette.grey[800],
          light: theme.palette.grey[700],
          dark: theme.palette.grey[900],
          contrastText: "#fff",
          background: `linear-gradient(135deg, ${theme.palette.grey[700]}20, ${theme.palette.grey[900]}30)`,
        };
      case "light":
        return {
          main: theme.palette.grey[200],
          light: theme.palette.grey[100],
          dark: theme.palette.grey[300],
          contrastText: theme.palette.text.primary,
          background: `linear-gradient(135deg, ${theme.palette.grey[100]}70, ${theme.palette.grey[300]}30)`,
        };
      default:
        return {
          main: theme.palette.primary.main,
          light: theme.palette.primary.light,
          dark: theme.palette.primary.dark,
          contrastText: theme.palette.primary.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}30)`,
        };
    }
  };

  const colorSet = getColorSet();

  // Function to show trend arrow and color
  const getTrendDisplay = () => {
    if (trendValue === undefined) return null;

    const isPositive = trendValue > 0;
    const isNeutral = trendValue === 0;

    const trendColor = isPositive
      ? theme.palette.success.main
      : isNeutral
      ? theme.palette.grey[500]
      : theme.palette.error.main;
    const TrendIcon = isPositive ? "↑" : isNeutral ? "→" : "↓";

    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: trendColor,
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
          }}
        >
          <Box component="span" sx={{ mr: 0.5, fontSize: "1.1em" }}>
            {TrendIcon}
          </Box>
          {Math.abs(trendValue)}%
        </Typography>
        {trendLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            {trendLabel}
          </Typography>
        )}
      </Box>
    );
  };

  // Define default chart data if none provided
  const defaultChartData = [
    { value: 20, label: "Thứ 2" },
    { value: 40, label: "Thứ 3" },
    { value: 35, label: "Thứ 4" },
    { value: 50, label: "Thứ 5" },
    { value: 45, label: "Thứ 6" },
    { value: 65, label: "Thứ 7" },
    { value: 55, label: "CN" },
  ];

  const finalChartData = chartData || defaultChartData;

  return (
    <Fade in timeout={300} style={{ transitionDelay: `${delay}ms` }}>
      <Paper
        elevation={1}
        sx={{
          p: 2.5,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.3s, box-shadow 0.3s",
          background: colorSet.background,
          borderRadius: 2,
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
          cursor: onClick ? "pointer" : "default",
          "&:hover": onClick
            ? {
                transform: "translateY(-4px)",
                boxShadow: 4,
                "& .stats-card-icon": {
                  transform: "scale(1.1)",
                },
              }
            : {},
        }}
        onClick={onClick}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: `${colorSet.main}20`,
            zIndex: 0,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Header with title and icon */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              {title}
            </Typography>

            <Box
              className="stats-card-icon"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                width: 40,
                height: 40,
                backgroundColor: `${colorSet.main}20`,
                color: colorSet.main,
                transition: "transform 0.3s ease",
              }}
            >
              {icon}
            </Box>
          </Box>

          {/* Value */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              fontSize: "1.75rem",
            }}
          >
            {value}
          </Typography>

          {/* Subtitle or trend */}
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
              {subtitle}
            </Typography>
          )}

          {/* Trend display */}
          {getTrendDisplay()}

          {/* Chart */}
          {finalChartData?.length > 1 && (
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    {trendLabel || "Thống kê"}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {finalChartData.map((point, i) => (
                      <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ mr: 2 }}>
                          {point.label || `Điểm ${i + 1}`}:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                          {point.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              }
              TransitionComponent={Zoom}
              arrow
              placement="top"
            >
              <Box sx={{ mt: trendValue !== undefined || subtitle ? 2 : 3 }}>
                <StatChart data={finalChartData} type={chartType} height={50} color={colorSet.main} fillOpacity={0.2} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Paper>
    </Fade>
  );
}
