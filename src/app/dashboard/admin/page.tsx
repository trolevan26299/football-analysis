"use client";
import React, { memo, useEffect } from "react";
import ErrorAlert from "@/components/ui/ErrorAlert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Box, Grid } from "@mui/material";

// Import các component đã được tách
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import StatsSection from "@/components/admin/dashboard/stats/StatsSection";
import DataTabs from "@/components/admin/dashboard/DataTabs";
import LeagueStatsCard from "@/components/admin/dashboard/cards/LeagueStatsCard";
import QuickActionsCard from "@/components/admin/dashboard/cards/QuickActionsCard";

// Import Redux hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { fetchDashboardData, clearDashboardError } from "@/redux/slices/dashboardSlice";

const AdminDashboard = memo(function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { data: stats, loading, error } = useAppSelector((state) => state.dashboard);
  
  const fetchData = () => {
    dispatch(fetchDashboardData());
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleDismissError = () => {
    dispatch(clearDashboardError());
  };

  if (loading) {
    return <LoadingSpinner variant="overlay" message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return <ErrorAlert message={error} severity="error" variant="toast" onClose={handleDismissError} />;
  }

  if (!stats) {
    return <Box>Không có dữ liệu</Box>;
  }

  return (
    <Box>
      {/* Header */}
      <DashboardHeader onRefresh={fetchData} />

      {/* Stats Cards */}
      <StatsSection
        totalMatches={stats.totalMatches || 0}
        pendingAnalysis={stats.pendingAnalysis || 0}
        totalArticles={stats.totalArticles || 0}
        totalUsers={stats.totalUsers || 0}
      />

      {/* Recent data tabs */}
      <DataTabs
        matches={stats.recentMatches || []}
        articles={stats.recentArticles || []}
      />

      {/* Additional stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LeagueStatsCard
            totalLeagues={stats.totalLeagues || 0}
            activeLeagues={stats.activeLeagues || 0}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <QuickActionsCard />
        </Grid>
      </Grid>
    </Box>
  );
});

export default AdminDashboard;
