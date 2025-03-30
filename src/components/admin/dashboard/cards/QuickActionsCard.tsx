"use client";
import React, { memo } from "react";
import { Box, Button, Chip, Divider, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { LocalFireDepartment as HotIcon } from "@mui/icons-material";

const QuickActionsCard = memo(function QuickActionsCard() {
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
            onClick={() => window.location.href = "/admin/matches/new"}
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
            onClick={() => window.location.href = "/admin/users"}
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
            onClick={() => window.location.href = "/admin/reports"}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Xem
          </Button>
        </ListItem>
      </List>
    </Paper>
  );
});

export default QuickActionsCard; 