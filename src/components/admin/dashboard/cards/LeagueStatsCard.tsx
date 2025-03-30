"use client";
import React, { memo } from "react";
import { Box, Button, Divider, Grid, Paper, Typography } from "@mui/material";
import { EmojiEvents as LeagueIcon } from "@mui/icons-material";

interface LeagueStatsCardProps {
  totalLeagues: number;
  activeLeagues: number;
}

const LeagueStatsCard = memo(function LeagueStatsCard({
  totalLeagues,
  activeLeagues,
}: LeagueStatsCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        height: "100%",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <LeagueIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          Thống kê giải đấu
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "rgba(25, 118, 210, 0.05)" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {totalLeagues || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số giải
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "rgba(76, 175, 80, 0.05)" }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {activeLeagues || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Giải đang hoạt động
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: "right" }}>
        <Button
          color="primary"
          onClick={() => window.location.href = "/admin/leagues"}
          sx={{ textTransform: "none" }}
        >
          Quản lý giải đấu
        </Button>
      </Box>
    </Paper>
  );
});

export default LeagueStatsCard; 