"use client";
import React, { memo, useState, useCallback } from "react";
import { Box, Paper, Tabs, Tab, List, ListItem, Divider, Chip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { SportsSoccer as MatchIcon, Article as ArticleIcon } from "@mui/icons-material";

// Define a TabPanel component
const TabPanel = memo(function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ p: { xs: 2, md: 3 } }}>
      {value === index && children}
    </Box>
  );
});

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: string;
}

interface ArticleData {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface DataTabsProps {
  matches: MatchData[];
  articles: ArticleData[];
}

const DataTabs = memo(function DataTabs({ matches, articles }: DataTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  return (
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

      {/* Matches Tab */}
      <TabPanel value={activeTab} index={0}>
        {matches && matches.length > 0 ? (
          <List sx={{ width: "100%" }}>
            {matches.map((match, index) => (
              <React.Fragment key={match.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    p: 2,
                    transition: "all 0.2s ease",
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", width: "100%", alignItems: "center", gap: 2 }}>
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
                    />
                  </Box>
                </ListItem>
                {index < matches.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ py: 5, textAlign: "center" }}>
            Không có trận đấu gần đây
          </Typography>
        )}
      </TabPanel>

      {/* Articles Tab */}
      <TabPanel value={activeTab} index={1}>
        {articles && articles.length > 0 ? (
          <List sx={{ width: "100%" }}>
            {articles.map((article, index) => (
              <React.Fragment key={article.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    p: 2,
                    transition: "all 0.2s ease",
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", width: "100%", alignItems: "center", gap: 2 }}>
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
                    />
                  </Box>
                </ListItem>
                {index < articles.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ py: 5, textAlign: "center" }}>
            Không có bài viết gần đây
          </Typography>
        )}
      </TabPanel>
    </Paper>
  );
});

export default DataTabs; 