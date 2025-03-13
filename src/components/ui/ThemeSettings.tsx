"use client";
import React from "react";
import { Drawer, Box, Typography, IconButton, FormControlLabel, Switch, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close as CloseIcon } from "@mui/icons-material";
import { useThemeMode } from "@/theme/theme";

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 280,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
}));

const ColorOption = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "color",
})<{ active?: boolean; color: string }>(({ active, color, theme }) => ({
  width: 40,
  height: 40,
  cursor: "pointer",
  borderRadius: "50%",
  backgroundColor: color,
  border: `2px solid ${active ? theme.palette.primary.main : "transparent"}`,
  transition: "border-color 0.15s ease-in-out",
  "&:hover": {
    borderColor: active ? theme.palette.primary.main : theme.palette.divider,
  },
}));

type ThemeColorOption = "blue" | "purple" | "teal";

export default function ThemeSettings({ open, onClose }: ThemeSettingsProps) {
  const { themeMode, toggleThemeMode, themeColor, setThemeColor, isDense, toggleDensity } = useThemeMode();

  const colorOptions = [
    { name: "blue" as ThemeColorOption, color: "#2563eb", title: "Xanh dương" },
    { name: "purple" as ThemeColorOption, color: "#8b5cf6", title: "Tím" },
    { name: "teal" as ThemeColorOption, color: "#14b8a6", title: "Ngọc" },
  ];

  return (
    <StyledDrawer anchor="right" open={open} onClose={onClose} transitionDuration={150}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Cài đặt giao diện
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Chế độ màu
        </Typography>
        <FormControlLabel
          control={<Switch checked={themeMode === "dark"} onChange={toggleThemeMode} />}
          label={themeMode === "dark" ? "Tối" : "Sáng"}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Màu chủ đạo
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          {colorOptions.map((option) => (
            <Box key={option.name} sx={{ textAlign: "center" }}>
              <ColorOption
                color={option.color}
                active={themeColor === option.name}
                onClick={() => setThemeColor(option.name)}
              />
              <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                {option.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Mật độ giao diện
        </Typography>
        <FormControlLabel
          control={<Switch checked={isDense} onChange={toggleDensity} />}
          label={isDense ? "Gọn" : "Thông thường"}
        />
      </Box>
    </StyledDrawer>
  );
}
