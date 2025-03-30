"use client";
import React, { memo } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import PageTitle from "@/components/ui/PageTitle";

interface DashboardHeaderProps {
  username?: string;
  onRefresh: () => void;
}

const DashboardHeader = memo(function DashboardHeader({ 
  username = "Admin", 
  onRefresh 
}: DashboardHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        mb: 4,
      }}
    >
      <Box>
        <PageTitle 
          title={`Xin chào, ${username}`}
          gutterBottom
          withUnderline={false}
        />
        <Typography variant="body1" color="text.secondary">
          Chào mừng trở lại với hệ thống quản lý phân tích bóng đá
        </Typography>
      </Box>
      <Button
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        variant="outlined"
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 2,
          fontWeight: "medium",
          transition: "background-color 0.2s, transform 0.2s",
          "&:hover": {
            transform: "translateY(-2px)"
          }
        }}
      >
        Làm mới dữ liệu
      </Button>
    </Box>
  );
});

export default DashboardHeader; 