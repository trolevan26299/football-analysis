"use client";

import React, { useState } from 'react';
import { Grid, Paper, Typography, Stack, Box, Button, Chip } from '@mui/material';
import { useGetMatchByIdQuery } from '@/redux/services/rtk-query';
import StatusChip from '@/components/ui/StatusChip';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdminLayout from '@/components/layouts/Layout';
import PageTitle from '@/components/ui/PageTitle';

interface MatchDetailPageProps {
  params: {
    id: string;
  };
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = params;
  const { data: match, isLoading, error } = useGetMatchByIdQuery(id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSpinner variant="overlay" message="Đang tải thông tin trận đấu..." />;
  }

  if (error) {
    return <ErrorAlert message="Không thể tải thông tin trận đấu" severity="error" />;
  }

  if (!match) {
    return <ErrorAlert message="Không tìm thấy thông tin trận đấu" severity="warning" />;
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {errorMessage && <ErrorAlert message={errorMessage} severity="error" onClose={() => setErrorMessage(null)} />}
        
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center" }}>
          <PageTitle title={`${match.homeTeam.name} vs ${match.awayTeam.name}`} />
          <Button variant="outlined" href="/admin/matches">
            Quay lại danh sách
          </Button>
        </Box>

        {/* Match Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin trận đấu
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giải đấu
                  </Typography>
                  <Typography variant="body1">
                    {match.leagueId?.name || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đội nhà
                  </Typography>
                  <Typography variant="body1">{match.homeTeam.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đội khách
                  </Typography>
                  <Typography variant="body1">{match.awayTeam.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian
                  </Typography>
                  <Typography variant="body1">
                    {new Date(match.matchDate).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <StatusChip
                    status={match.status}
                    label={
                      match.status === "scheduled"
                        ? "Chưa diễn ra"
                        : "Đã diễn ra"
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái phân tích
                  </Typography>
                  <StatusChip
                    status={match.analysisInfo?.isAnalyzed ? "success" : "pending"}
                    label={
                      match.analysisInfo?.isAnalyzed
                        ? "Đã phân tích"
                        : "Chưa phân tích"
                    }
                  />
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Analysis Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin phân tích
              </Typography>
              {match.analysis ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái AI
                    </Typography>
                    <Chip 
                      label={
                        match.analysis.aiStatus === "generated" 
                          ? "Đã tạo bài viết" 
                          : match.analysis.aiStatus === "processing" 
                          ? "Đang xử lý" 
                          : "Chưa tạo bài viết"
                      }
                      color={
                        match.analysis.aiStatus === "generated" 
                          ? "success" 
                          : match.analysis.aiStatus === "processing" 
                          ? "warning" 
                          : "default"
                      }
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số bài viết đã thu thập
                    </Typography>
                    <Typography variant="body1">
                      {match.analysis.articles?.length || 0} bài viết
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái phân tích AI
                    </Typography>
                    <Chip 
                      label={
                        match.analysis.aiAnalysis?.status === "completed" 
                          ? "Đã hoàn thành" 
                          : match.analysis.aiAnalysis?.status === "pending" 
                          ? "Đang chờ" 
                          : "Thất bại"
                      }
                      color={
                        match.analysis.aiAnalysis?.status === "completed" 
                          ? "success" 
                          : match.analysis.aiAnalysis?.status === "pending" 
                          ? "warning" 
                          : "error"
                      }
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái bài viết WordPress
                    </Typography>
                    <Chip 
                      label={
                        match.analysis.wordpressPost?.status === "published" 
                          ? "Đã đăng" 
                          : match.analysis.wordpressPost?.status === "draft" 
                          ? "Bản nháp" 
                          : "Lỗi"
                      }
                      color={
                        match.analysis.wordpressPost?.status === "published" 
                          ? "success" 
                          : match.analysis.wordpressPost?.status === "draft" 
                          ? "warning" 
                          : "error"
                      }
                      size="small"
                    />
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Trận đấu chưa được phân tích
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
} 