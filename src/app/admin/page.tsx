"use client";
import React, { memo, useEffect, useState, useCallback } from "react";
import ErrorAlert from "@/components/ui/ErrorAlert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Box, Grid } from "@mui/material";

// Import các component đã được tách
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import StatsSection from "@/components/admin/dashboard/stats/StatsSection";
import DataTabs from "@/components/admin/dashboard/DataTabs";
import LeagueStatsCard from "@/components/admin/dashboard/cards/LeagueStatsCard";
import QuickActionsCard from "@/components/admin/dashboard/cards/QuickActionsCard";

interface DashboardStats {
  totalMatches: number;
  pendingAnalysis: number;
  totalArticles: number;
  totalUsers: number;
  totalLeagues: number;
  activeLeagues: number;
  recentMatches: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    status: string;
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

const AdminDashboard = memo(function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Không thể tải dữ liệu dashboard");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner variant="overlay" message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return <ErrorAlert message={error} severity="error" variant="toast" onClose={() => setError(null)} />;
  }

  return (
    <Box>
      {/* Header */}
      <DashboardHeader onRefresh={fetchDashboardData} />

      {/* Stats Cards */}
      <StatsSection
        totalMatches={stats?.totalMatches || 0}
        pendingAnalysis={stats?.pendingAnalysis || 0}
        totalArticles={stats?.totalArticles || 0}
        totalUsers={stats?.totalUsers || 0}
      />

      {/* Recent data tabs */}
      <DataTabs
        matches={stats?.recentMatches || []}
        articles={stats?.recentArticles || []}
      />

      {/* Additional stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LeagueStatsCard
            totalLeagues={stats?.totalLeagues || 0}
            activeLeagues={stats?.activeLeagues || 0}
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
