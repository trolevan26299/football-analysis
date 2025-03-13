"use client";
import React from "react";
import ErrorAlert from "@/components/ui/ErrorAlert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatsCard from "@/components/ui/StatsCard";
import {
  Article as ArticleIcon,
  SportsSoccer as MatchIcon,
  Refresh as RefreshIcon,
  Group as UserIcon,
  EmojiEvents as LeagueIcon,
  LocalFireDepartment as HotIcon,
  ViewList as ListIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { useEffect, useState } from "react";
import PageTitle from "@/components/ui/PageTitle";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchDashboardData = async () => {
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
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <LoadingSpinner variant="overlay" message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return <ErrorAlert message={error} severity="error" variant="toast" onClose={() => setError(null)} />;
  }

  return (
    <Box>
      {/* Header with greeting and refresh button */}
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
            title={`Xin chào, ${stats?.totalUsers ? "Admin" : "Admin"}`}
            gutterBottom
            withUnderline={false}
          />
          <Typography variant="body1" color="text.secondary">
            Chào mừng trở lại với hệ thống quản lý phân tích bóng đá
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 2,
            fontWeight: "medium",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          Làm mới dữ liệu
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Tổng trận đấu"
            value={stats?.totalMatches || 0}
            icon={<MatchIcon />}
            color="primary"
            subtitle="Số lượng trận đã thêm vào hệ thống"
            delay={100}
            onClick={() => (window.location.href = "/admin/matches")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Chờ phân tích"
            value={stats?.pendingAnalysis || 0}
            icon={<ListIcon />}
            color="warning"
            subtitle="Trận đấu cần phân tích"
            trendValue={stats?.pendingAnalysis ? Math.round((stats.pendingAnalysis / stats.totalMatches) * 100) : 0}
            trendLabel="so với tổng số"
            delay={200}
            onClick={() => (window.location.href = "/admin/matches?filter=pending")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Bài viết đã xuất bản"
            value={stats?.totalArticles || 0}
            icon={<ArticleIcon />}
            color="success"
            subtitle="Số bài phân tích đã xuất bản"
            delay={300}
            onClick={() => (window.location.href = "/admin/posts")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="KTV hiện có"
            value={stats?.totalUsers || 0}
            icon={<UserIcon />}
            color="secondary"
            subtitle="Số lượng KTV trong hệ thống"
            delay={400}
            onClick={() => (window.location.href = "/admin/users")}
          />
        </Grid>
      </Grid>

      {/* Recent data tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          mb: 4,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              ".MuiTab-root": {
                textTransform: "none",
                fontWeight: "medium",
                fontSize: "1rem",
                minHeight: 48,
              },
            }}
          >
            <Tab label="Trận đấu gần đây" icon={<MatchIcon />} iconPosition="start" sx={{ py: 2 }} />
            <Tab label="Bài viết mới" icon={<ArticleIcon />} iconPosition="start" sx={{ py: 2 }} />
          </Tabs>
        </Box>

        {/* Recent Matches */}
        <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === 0 && (
            <Fade in={activeTab === 0} timeout={500}>
              <Box>
                {stats?.recentMatches && stats.recentMatches.length > 0 ? (
                  <List sx={{ width: "100%" }}>
                    {stats.recentMatches.map((match, index) => (
                      <React.Fragment key={match.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            p: 2,
                            transition: "all 0.2s ease",
                            borderRadius: 2,
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.03)",
                              transform: "translateX(5px)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", width: "100%", alignItems: "center", gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                width: 40,
                                height: 40,
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {match.homeTeam} vs {match.awayTeam}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(match.date).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </Typography>
                            </Box>
                            <Chip
                              label={match.status === "completed" ? "Hoàn thành" : "Chờ xử lý"}
                              color={match.status === "completed" ? "success" : "warning"}
                              size="small"
                              sx={{ fontWeight: "medium" }}
                            />
                          </Box>
                        </ListItem>
                        {index < stats.recentMatches.length - 1 && (
                          <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Không có trận đấu gần đây
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Button
                    color="primary"
                    onClick={() => (window.location.href = "/admin/matches")}
                    sx={{ textTransform: "none" }}
                  >
                    Xem tất cả trận đấu
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </Box>

        {/* Recent Articles */}
        <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === 1 && (
            <Fade in={activeTab === 1} timeout={500}>
              <Box>
                {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                  <List sx={{ width: "100%" }}>
                    {stats.recentArticles.map((article, index) => (
                      <React.Fragment key={article.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            p: 2,
                            transition: "all 0.2s ease",
                            borderRadius: 2,
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.03)",
                              transform: "translateX(5px)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", width: "100%", alignItems: "center", gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: "secondary.main",
                                width: 40,
                                height: 40,
                              }}
                            >
                              <ArticleIcon />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {article.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {article.createdAt
                                  ? new Date(article.createdAt).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Chưa cập nhật"}
                              </Typography>
                            </Box>
                            <Chip
                              label={article.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                              color={article.status === "published" ? "success" : "default"}
                              size="small"
                              sx={{ fontWeight: "medium" }}
                            />
                          </Box>
                        </ListItem>
                        {index < stats.recentArticles.length - 1 && (
                          <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Không có bài viết gần đây
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Button
                    color="primary"
                    onClick={() => (window.location.href = "/admin/posts")}
                    sx={{ textTransform: "none" }}
                  >
                    Xem tất cả bài viết
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>

      {/* Additional stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
                    {stats?.totalLeagues || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng số giải
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "rgba(76, 175, 80, 0.05)" }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {stats?.activeLeagues || 0}
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
                onClick={() => (window.location.href = "/admin/leagues")}
                sx={{ textTransform: "none" }}
              >
                Quản lý giải đấu
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
              <HotIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Tác vụ nổi bật
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <List>
              <ListItem sx={{ px: 1, py: 1.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Chip label="Mới" size="small" color="error" sx={{ mr: 1, fontWeight: "bold" }} />
                      <Typography variant="body1">Thêm trận đấu mới</Typography>
                    </Box>
                  }
                  secondary="Tạo trận đấu mới để phân tích"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => (window.location.href = "/admin/matches/new")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Thêm
                </Button>
              </ListItem>

              <ListItem sx={{ px: 1, py: 1.5 }}>
                <ListItemText primary="Quản lý KTV" secondary="Thêm và quản lý người dùng KTV" />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => (window.location.href = "/admin/users")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Quản lý
                </Button>
              </ListItem>

              <ListItem sx={{ px: 1, py: 1.5 }}>
                <ListItemText primary="Xem báo cáo" secondary="Xem thống kê và báo cáo phân tích" />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => (window.location.href = "/admin/reports")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Xem
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
