"use client";
import React from "react";
import { Drawer, Box, Typography, IconButton, FormControlLabel, Switch, Divider, Paper, Tooltip, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Close as CloseIcon,
  Brightness4 as DarkIcon,
  LightMode as LightIcon,
  Palette as PaletteIcon,
  AutoFixHigh as EffectsIcon,
  AspectRatio as DensityIcon
} from "@mui/icons-material";
import { useThemeMode } from "@/theme/theme";

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 320,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    backgroundImage: 'none',
    boxShadow: theme.palette.mode === 'dark' ? '0 0 15px rgba(0, 0, 0, 0.5)' : 'none',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
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
  transition: "all 0.2s ease-in-out",
  transform: active ? 'scale(1.05)' : 'scale(1)',
  boxShadow: active 
    ? `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}, 0 4px 6px rgba(0, 0, 0, 0.2)` 
    : 'none',
  "&:hover": {
    transform: 'scale(1.05)',
    borderColor: active ? theme.palette.primary.main : theme.palette.divider,
    boxShadow: `0 4px 8px rgba(0, 0, 0, 0.2)`,
  },
}));

const SettingSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundImage: 'none',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.02)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.08)',
  }
}));

type ThemeColorOption = "blue" | "purple" | "teal" | "green" | "amber";

export default function ThemeSettings({ open, onClose }: ThemeSettingsProps) {
  const { themeMode, toggleThemeMode, themeColor, setThemeColor, isDense, toggleDensity } = useThemeMode();

  const colorOptions = [
    { name: "blue" as ThemeColorOption, color: "#1976d2", title: "Xanh dương" },
    { name: "purple" as ThemeColorOption, color: "#8b5cf6", title: "Tím" },
    { name: "teal" as ThemeColorOption, color: "#14b8a6", title: "Ngọc" },
    { name: "green" as ThemeColorOption, color: "#10b981", title: "Xanh lá" },
    { name: "amber" as ThemeColorOption, color: "#f59e0b", title: "Hổ phách" },
  ];

  return (
    <StyledDrawer anchor="right" open={open} onClose={onClose} transitionDuration={300}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EffectsIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Cài đặt giao diện
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              transform: 'rotate(90deg)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <SettingSection elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          {themeMode === 'dark' ? <DarkIcon fontSize="small" color="primary" /> : <LightIcon fontSize="small" color="primary" />}
          <Typography variant="subtitle1" fontWeight={500}>
            Chế độ màu
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          p: 1, 
          borderRadius: 2,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
        }}>
          <Tooltip title="Chế độ sáng" arrow>
            <Paper
              elevation={themeMode === 'light' ? 2 : 0}
              onClick={() => themeMode === 'dark' && toggleThemeMode()}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
                cursor: 'pointer',
                backgroundColor: themeMode === 'light' 
                  ? (theme) => theme.palette.background.paper 
                  : 'transparent',
                border: (theme) => `1px solid ${themeMode === 'light' 
                  ? theme.palette.primary.main 
                  : 'transparent'}`,
                borderRadius: 1,
                transition: 'all 0.2s',
                opacity: themeMode === 'light' ? 1 : 0.6,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <LightIcon 
                sx={{ 
                  color: (theme) => themeMode === 'light' ? theme.palette.primary.main : 'inherit',
                  mb: 0.5 
                }} 
              />
              <Typography variant="caption">Sáng</Typography>
            </Paper>
          </Tooltip>
          
          <Tooltip title="Chế độ tối" arrow>
            <Paper
              elevation={themeMode === 'dark' ? 2 : 0}
              onClick={() => themeMode === 'light' && toggleThemeMode()}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
                cursor: 'pointer',
                backgroundColor: themeMode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.4)' 
                  : 'transparent',
                border: (theme) => `1px solid ${themeMode === 'dark' 
                  ? theme.palette.primary.main 
                  : 'transparent'}`,
                borderRadius: 1,
                transition: 'all 0.2s',
                opacity: themeMode === 'dark' ? 1 : 0.6,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <DarkIcon 
                sx={{ 
                  color: (theme) => themeMode === 'dark' ? theme.palette.primary.main : 'inherit',
                  mb: 0.5 
                }} 
              />
              <Typography variant="caption">Tối</Typography>
            </Paper>
          </Tooltip>
        </Box>
      </SettingSection>

      <SettingSection elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PaletteIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={500}>
            Màu chủ đạo
          </Typography>
        </Box>
        
        <Fade in={true} timeout={500}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {colorOptions.map((option) => (
              <Tooltip key={option.name} title={option.title} arrow placement="top">
                <Box sx={{ textAlign: "center" }}>
                  <ColorOption
                    color={option.color}
                    active={themeColor === option.name}
                    onClick={() => setThemeColor(option.name)}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5, 
                      display: "block",
                      fontWeight: themeColor === option.name ? 700 : 400,
                      color: themeColor === option.name ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {option.title}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Fade>
      </SettingSection>

      <SettingSection elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <DensityIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={500}>
            Mật độ giao diện
          </Typography>
        </Box>
        
        <FormControlLabel
          control={
            <Switch 
              checked={isDense} 
              onChange={toggleDensity}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: (theme) => theme.palette.primary.main,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: (theme) => theme.palette.primary.main,
                }
              }}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {isDense ? "Gọn (cho màn hình nhỏ)" : "Tiêu chuẩn"}
            </Typography>
          }
          sx={{ ml: 0 }}
        />
      </SettingSection>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Các cài đặt sẽ được lưu trên trình duyệt của bạn
      </Typography>
    </StyledDrawer>
  );
}
