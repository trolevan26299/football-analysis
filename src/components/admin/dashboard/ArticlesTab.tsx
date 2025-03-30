"use client";
import React, { memo } from "react";
import {
  List,
  ListItem,
  Avatar,
  Box,
  Chip,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { Article as ArticleIcon } from "@mui/icons-material";

interface ArticlesTabProps {
  articles: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

const ArticlesTab = memo(function ArticlesTab({ articles }: ArticlesTabProps) {
  if (!articles || articles.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ py: 5, textAlign: "center" }}>
        Không có bài viết gần đây
      </Typography>
    );
  }

  return (
    <>
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
            {index < articles.length - 1 && (
              <Divider variant="inset" component="li" sx={{ ml: 7 }} />
            )}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button
          color="primary"
          onClick={() => (window.location.href = "/admin/posts")}
          sx={{ textTransform: "none" }}
        >
          Xem tất cả bài viết
        </Button>
      </Box>
    </>
  );
});

ArticlesTab.displayName = "ArticlesTab";

export default ArticlesTab; 