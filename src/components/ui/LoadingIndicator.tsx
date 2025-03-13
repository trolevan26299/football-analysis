"use client";

import React from "react";
import { Box, CircularProgress, LinearProgress, Typography, Fade, Paper } from "@mui/material";
import { LoadingProps } from "@/types/ui";

/**
 * Enhanced loading indicator component with multiple variants and animations
 */
export default function LoadingIndicator({
  size = "medium",
  color = "primary",
  variant = "circular",
  message = "Đang tải...",
  fullPage = false,
}: LoadingProps) {
  // Map size values to pixel sizes for circular progress
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  // Map size values to thickness for circular progress
  const thicknessMap = {
    small: 2,
    medium: 3.6,
    large: 5,
  };

  // Circular spinner component
  const CircularLoader = () => (
    <CircularProgress
      size={sizeMap[size]}
      color={color}
      thickness={thicknessMap[size]}
      sx={{
        animation: "pulse 1.5s infinite ease-in-out",
        filter: (theme) => 
          theme.palette.mode === 'dark' 
            ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))' 
            : 'none',
        "@keyframes pulse": {
          "0%": {
            opacity: 1,
            transform: "scale(1)",
          },
          "50%": {
            opacity: 0.8,
            transform: "scale(0.98)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    />
  );

  // Linear progress component
  const LinearLoader = () => (
    <Box sx={{ width: "100%", maxWidth: 300 }}>
      <LinearProgress
        color={color}
        sx={{
          height: size === "small" ? 4 : size === "medium" ? 6 : 8,
          borderRadius: size === "small" ? 2 : size === "medium" ? 3 : 4,
          boxShadow: (theme) => 
            theme.palette.mode === 'dark' 
              ? '0 0 8px rgba(0, 0, 0, 0.3)' 
              : 'none',
        }}
      />
    </Box>
  );

  // Dots loader component
  const DotsLoader = () => (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: size === "small" ? 6 : size === "medium" ? 10 : 14,
            height: size === "small" ? 6 : size === "medium" ? 10 : 14,
            backgroundColor: (theme) => 
              `${theme.palette.mode === 'dark' ? theme.palette[color].light : theme.palette[color].main}`,
            borderRadius: "50%",
            filter: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.2))' 
                : 'none',
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: `${dot * 0.16}s`,
            "@keyframes bounce": {
              "0%, 80%, 100%": {
                transform: "scale(0)",
              },
              "40%": {
                transform: "scale(1)",
              },
            },
          }}
        />
      ))}
    </Box>
  );

  // Full page overlay loading
  if (fullPage) {
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "light" 
                ? "rgba(255, 255, 255, 0.85)" 
                : "rgba(10, 17, 34, 0.85)", // Tối hơn và phù hợp với dark theme
            zIndex: 9999,
            backdropFilter: "blur(8px)", // Tăng độ blur từ 4px lên 8px
          }}
        >
          <Paper
            elevation={4}
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              maxWidth: "80%",
              background: (theme) =>
                theme.palette.mode === "light" 
                  ? "rgba(255, 255, 255, 0.95)" 
                  : "rgba(17, 24, 39, 0.95)", // Phù hợp với màu paper trong theme
              borderRadius: 2,
              boxShadow: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 255, 255, 0.05)' 
                  : '0 8px 16px rgba(0, 0, 0, 0.1)',
              border: (theme) => 
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.05)'
                  : 'none'
            }}
          >
            {variant === "circular" && <CircularLoader />}
            {variant === "linear" && <LinearLoader />}
            {variant === "dots" && <DotsLoader />}

            <Typography
              variant={size === "large" ? "h6" : "body1"}
              color="textSecondary"
              sx={{
                mt: 2,
                fontWeight: 500,
                animation: "fadeInOut 2s infinite ease-in-out",
                "@keyframes fadeInOut": {
                  "0%": { opacity: 0.7 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.7 },
                },
              }}
            >
              {message}
            </Typography>
          </Paper>
        </Box>
      </Fade>
    );
  }

  // Regular inline loading indicator
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        padding: 1,
        borderRadius: 1,
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' 
            ? 'rgba(17, 24, 39, 0.4)' 
            : 'transparent',
      }}
    >
      {variant === "circular" && <CircularLoader />}
      {variant === "linear" && <LinearLoader />}
      {variant === "dots" && <DotsLoader />}

      {message && (
        <Typography
          variant={size === "small" ? "caption" : "body2"}
          color="textSecondary"
          sx={{
            mt: 1,
            fontWeight: 500,
            animation: "fadeInOut 2s infinite ease-in-out",
            "@keyframes fadeInOut": {
              "0%": { opacity: 0.7 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.7 },
            },
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
