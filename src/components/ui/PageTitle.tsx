"use client";

import React from "react";
import { Typography, TypographyProps, Box } from "@mui/material";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  withUnderline?: boolean;
  variant?: TypographyProps['variant'];
  sx?: TypographyProps['sx'];
  gutterBottom?: boolean;
}

/**
 * Component tiêu đề trang với màu sắc tối ưu cho cả light và dark mode
 * Hỗ trợ thêm subtitle và icon
 */
export default function PageTitle({ 
  title, 
  subtitle,
  icon,
  withUnderline = true, 
  variant = "h4", 
  sx,
  gutterBottom = true,
  ...props 
}: PageTitleProps) {
  return (
    <Box 
      sx={{
        mb: gutterBottom ? 3 : 0,
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'primary.main',
              fontSize: variant === 'h4' ? 32 : 24
            }}
          >
            {icon}
          </Box>
        )}
        
        <Box>
          <Typography
            variant={variant}
            component="h1"
            sx={{
              fontWeight: 700,
              position: "relative",
              display: "inline-block",
              color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : theme.palette.text.primary,
              mb: subtitle ? 0.5 : 0
            }}
            {...props}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontSize: '0.95rem',
                opacity: 0.9
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {withUnderline && (
        <Box 
          sx={{
            mt: 2,
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: "primary.main",
          }}
        />
      )}
    </Box>
  );
} 