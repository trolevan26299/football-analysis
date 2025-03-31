"use client";

import React from "react";
import { Chip, Tooltip, useTheme } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Pause as PauseIcon,
  HourglassEmpty as HourglassEmptyIcon,
  ErrorOutline as ErrorOutlineIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

export type StatusType =
  | "completed"
  | "success"
  | "failed"
  | "error"
  | "pending"
  | "processing"
  | "active"
  | "inactive"
  | "paused"
  | "cancelled"
  | "scheduled"
  | "published"
  | "draft"
  | "approved"
  | "rejected";

export interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  size?: "small" | "medium";
  bordered?: boolean;
  pulse?: boolean;
  withDot?: boolean;
  withIcon?: boolean;
  variant?: "outlined" | "filled" | "gradient";
  tooltip?: string;
  className?: string;
  iconPosition?: "start" | "end";
  onClick?: () => void;
}

export default function StatusChip({
  status,
  label,
  size = "small",
  bordered = false,
  pulse = false,
  withDot = false,
  withIcon = true,
  variant = "filled",
  tooltip,
  className,
  iconPosition = "start",
  onClick,
}: StatusChipProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Get color and icon based on status
  const getStatusConfig = (status: string) => {
    const lowercasedStatus = status?.toLowerCase() || "";

    switch (lowercasedStatus) {
      case "completed":
      case "success":
      case "active":
      case "published":
      case "approved":
        return {
          color: theme.palette.success.main,
          lightColor: theme.palette.success.light,
          darkColor: theme.palette.success.dark,
          bgColor: isDarkMode ? alpha(theme.palette.success.main, 0.4) : alpha(theme.palette.success.light, 0.5),
          icon: <CheckCircleIcon fontSize="inherit" />,
          borderColor: theme.palette.success.main,
          gradient: `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
          muiColor: "success",
        };

      case "failed":
      case "error":
      case "rejected":
        return {
          color: theme.palette.error.main,
          lightColor: theme.palette.error.light,
          darkColor: theme.palette.error.dark,
          bgColor: isDarkMode ? alpha(theme.palette.error.main, 0.4) : alpha(theme.palette.error.light, 0.5),
          icon: <CancelIcon fontSize="inherit" />,
          borderColor: theme.palette.error.main,
          gradient: `linear-gradient(90deg, ${theme.palette.error.light}, ${theme.palette.error.main})`,
          muiColor: "error",
        };

      case "pending":
      case "scheduled":
        return {
          color: theme.palette.warning.main,
          lightColor: theme.palette.warning.light,
          darkColor: theme.palette.warning.dark,
          bgColor: isDarkMode ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.warning.light, 0.5),
          icon: <AccessTimeIcon fontSize="inherit" />,
          borderColor: theme.palette.warning.main,
          gradient: `linear-gradient(90deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`,
          muiColor: "warning",
        };

      case "processing":
      case "in_progress":
        return {
          color: theme.palette.info.main,
          lightColor: theme.palette.info.light,
          darkColor: theme.palette.info.dark,
          bgColor: isDarkMode ? alpha(theme.palette.info.main, 0.4) : alpha(theme.palette.info.light, 0.5),
          icon: <HourglassEmptyIcon fontSize="inherit" />,
          borderColor: theme.palette.info.main,
          gradient: `linear-gradient(90deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
          muiColor: "info",
        };

      case "paused":
      case "inactive":
        return {
          color: theme.palette.grey[500],
          lightColor: theme.palette.grey[400],
          darkColor: theme.palette.grey[600],
          bgColor: isDarkMode ? alpha(theme.palette.grey[500], 0.4) : alpha(theme.palette.grey[300], 0.6),
          icon: <PauseIcon fontSize="inherit" />,
          borderColor: theme.palette.grey[500],
          gradient: `linear-gradient(90deg, ${theme.palette.grey[400]}, ${theme.palette.grey[600]})`,
          muiColor: "default",
        };

      case "cancelled":
        return {
          color: theme.palette.error.main,
          lightColor: theme.palette.error.light,
          darkColor: theme.palette.error.dark,
          bgColor: isDarkMode ? alpha(theme.palette.error.main, 0.4) : alpha(theme.palette.error.light, 0.5),
          icon: <CancelIcon fontSize="inherit" />,
          borderColor: theme.palette.error.main,
          gradient: `linear-gradient(90deg, ${theme.palette.error.light}, ${theme.palette.error.main})`,
          muiColor: "error",
        };

      case "draft":
        return {
          color: theme.palette.grey[600],
          lightColor: theme.palette.grey[500],
          darkColor: theme.palette.grey[700],
          bgColor: isDarkMode ? alpha(theme.palette.grey[600], 0.4) : alpha(theme.palette.grey[300], 0.6),
          icon: <ErrorOutlineIcon fontSize="inherit" />,
          borderColor: theme.palette.grey[600],
          gradient: `linear-gradient(90deg, ${theme.palette.grey[500]}, ${theme.palette.grey[700]})`,
          muiColor: "default",
        };

      default:
        return {
          color: theme.palette.primary.main,
          lightColor: theme.palette.primary.light,
          darkColor: theme.palette.primary.dark,
          bgColor: isDarkMode ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.primary.light, 0.5),
          icon: <CircleIcon fontSize="inherit" />,
          borderColor: theme.palette.primary.main,
          gradient: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          muiColor: "primary",
        };
    }
  };

  // Helper function for alpha color
  function alpha(color: string, opacity: number): string {
    // Simple alpha function for demonstration
    if (color.startsWith("#")) {
      return (
        color +
        Math.round(opacity * 255)
          .toString(16)
          .padStart(2, "0")
      );
    }
    return color;
  }

  const statusConfig = getStatusConfig(status);
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");

  // Determine which MUI variant to use based on our custom variant
  const getMuiVariant = () => {
    if (variant === "outlined") return "outlined";
    return "filled";
  };

  // Get the MUI color based on status
  const getMuiColor = () => {
    return statusConfig.muiColor as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  };

  const chipContent = (
    <Chip
      size={size}
      label={displayLabel}
      variant={getMuiVariant()}
      color={getMuiColor()}
      icon={withIcon && iconPosition === "start" ? statusConfig.icon : undefined}
      deleteIcon={withIcon && iconPosition === "end" ? statusConfig.icon : undefined}
      onDelete={withIcon && iconPosition === "end" ? () => {} : undefined}
      sx={{
        height: "auto",
        minHeight: size === "small" ? 24 : 32,
        borderRadius: size === "small" ? "12px" : "16px",
        px: size === "small" ? 1 : 1.5,
        py: 0.5,
        fontWeight: 600,
        ...(variant === "gradient" && {
          background: statusConfig.gradient,
          color: "#fff",
          textShadow: "0 1px 1px rgba(0,0,0,0.2)",
          border: "none",
          boxShadow: `0 1px 2px ${alpha("#000", 0.15)}`,
        }),
        ...(bordered && {
          borderWidth: 1.5,
          borderStyle: "solid",
          borderColor: statusConfig.borderColor,
        }),
        ...(withDot &&
          !withIcon && {
            "& .MuiChip-label": {
              display: "flex",
              alignItems: "center",
              "&::before": {
                content: '""',
                display: "inline-block",
                width: size === "small" ? 6 : 8,
                height: size === "small" ? 6 : 8,
                borderRadius: "50%",
                backgroundColor: "currentColor",
                marginRight: "6px",
                ...(pulse && {
                  animation: "pulse 1.5s infinite",
                  boxShadow: `0 0 0 0 currentColor`,
                  "@keyframes pulse": {
                    "0%": {
                      transform: "scale(0.95)",
                      boxShadow: `0 0 0 0 ${alpha(statusConfig.color, 0.7)}`,
                    },
                    "70%": {
                      transform: "scale(1)",
                      boxShadow: `0 0 0 5px ${alpha(statusConfig.color, 0)}`,
                    },
                    "100%": {
                      transform: "scale(0.95)",
                      boxShadow: `0 0 0 0 ${alpha(statusConfig.color, 0)}`,
                    },
                  },
                }),
              },
            },
          }),
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-1px)",
              boxShadow: `0 2px 4px ${alpha(statusConfig.color, 0.25)}`,
            }
          : {},
        "& .MuiChip-icon, & .MuiChip-deleteIcon": {
          color: "inherit",
          margin: iconPosition === "start" ? "0 -4px 0 6px" : "0 6px 0 -4px",
        },
        "& .MuiChip-label": {
          fontWeight: 600,
          padding: "0 8px",
          fontSize: size === "small" ? "0.75rem" : "0.875rem",
        },
      }}
      onClick={onClick}
      className={className}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {chipContent}
      </Tooltip>
    );
  }

  return chipContent;
}
