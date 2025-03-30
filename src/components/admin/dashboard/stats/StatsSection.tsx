"use client";
import React, { memo } from "react";
import { Grid } from "@mui/material";
import StatsCard from "@/components/ui/StatsCard";
import {
  Article as ArticleIcon,
  SportsSoccer as MatchIcon,
  Group as UserIcon,
  ViewList as ListIcon,
} from "@mui/icons-material";

interface StatsSectionProps {
  totalMatches: number;
  pendingAnalysis: number;
  totalArticles: number;
  totalUsers: number;
  totalMatches_pct?: number;
}

const StatsSection = memo(function StatsSection({
  totalMatches,
  pendingAnalysis,
  totalArticles,
  totalUsers,
}: StatsSectionProps) {
  // Tính phần trăm nếu có thể
  const pendingAnalysisPct = totalMatches ? Math.round((pendingAnalysis / totalMatches) * 100) : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 5 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Tổng trận đấu"
          value={totalMatches || 0}
          icon={<MatchIcon />}
          color="primary"
          subtitle="Số lượng trận đã thêm vào hệ thống"
          onClick={() => window.location.href = "/admin/matches"}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Chờ phân tích"
          value={pendingAnalysis || 0}
          icon={<ListIcon />}
          color="warning"
          subtitle="Trận đấu cần phân tích"
          trendValue={pendingAnalysisPct}
          trendLabel="so với tổng số"
          onClick={() => window.location.href = "/admin/matches?filter=pending"}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Bài viết đã xuất bản"
          value={totalArticles || 0}
          icon={<ArticleIcon />}
          color="success"
          subtitle="Số bài phân tích đã xuất bản"
          onClick={() => window.location.href = "/admin/posts"}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="KTV hiện có"
          value={totalUsers || 0}
          icon={<UserIcon />}
          color="secondary"
          subtitle="Số lượng KTV trong hệ thống"
          onClick={() => window.location.href = "/admin/users"}
        />
      </Grid>
    </Grid>
  );
});

export default StatsSection; 