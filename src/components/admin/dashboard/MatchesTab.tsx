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

interface MatchesTabProps {
  matches: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    status: string;
  }>;
}

const MatchesTab = memo(function MatchesTab({ matches }: MatchesTabProps) {
  if (!matches || matches.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ py: 5, textAlign: "center" }}>
        Không có trận đấu gần đây
      </Typography>
    );
  }

  return (
    <>
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
            {index < matches.length - 1 && (
              <Divider variant="inset" component="li" sx={{ ml: 7 }} />
            )}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button
          color="primary"
          onClick={() => (window.location.href = "/admin/matches")}
          sx={{ textTransform: "none" }}
        >
          Xem tất cả trận đấu
        </Button>
      </Box>
    </>
  );
});

MatchesTab.displayName = "MatchesTab";

export default MatchesTab; 