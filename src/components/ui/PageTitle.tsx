"use client";

import React from "react";
import { Typography, TypographyProps } from "@mui/material";

interface PageTitleProps {
  title: string;
  withUnderline?: boolean;
  variant?: TypographyProps['variant'];
  sx?: TypographyProps['sx'];
  gutterBottom?: boolean;
}

/**
 * Component tiêu đề trang với màu sắc tối ưu cho cả light và dark mode
 */
export default function PageTitle({ 
  title, 
  withUnderline = true, 
  variant = "h4", 
  sx,
  gutterBottom,
  ...props 
}: PageTitleProps) {
  return (
    <Typography
      variant={variant}
      component="h1"
      gutterBottom={gutterBottom}
      sx={{
        fontWeight: 700,
        position: "relative",
        display: "inline-block",
        color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : theme.palette.text.primary,
        ...(withUnderline && {
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: -8,
            left: 0,
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: "primary.main",
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {title}
    </Typography>
  );
} 