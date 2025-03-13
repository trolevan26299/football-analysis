"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout,
  SportsSoccer as MatchIcon,
  Dashboard as DashboardIcon,
  EmojiEvents as LeagueIcon,
  Person as UserIcon,
  Article as PostIcon,
} from "@mui/icons-material";
import ThemeSettings from "@/components/ui/ThemeSettings";
import { useThemeMode } from "@/theme/theme";
import { alpha } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { CSSObject, Theme } from "@mui/material/styles";
import { AppBarProps as MuiAppBarProps } from "@mui/material";

const drawerWidth = 240;

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: <DashboardIcon />,
  },
  {
    title: "Giải đấu",
    path: "/admin/leagues",
    icon: <LeagueIcon />,
  },
  {
    title: "Trận đấu",
    path: "/admin/matches",
    icon: <MatchIcon />,
  },
  {
    title: "Quản lý KTV",
    path: "/admin/users",
    icon: <UserIcon />,
  },
  {
    title: "Bài viết",
    path: "/admin/posts",
    icon: <PostIcon />,
  },
];

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.background.paper,
  borderBottom: theme.palette.mode === "light" ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.palette.mode === "light" ? "0 1px 2px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.3)",
  transition: "none",
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: "none",
  overflowX: "hidden",
  backgroundColor: theme.palette.mode === "light" ? "#fff" : theme.palette.background.paper,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: "none",
  overflowX: "hidden",
  backgroundColor: theme.palette.mode === "light" ? "#fff" : theme.palette.background.paper,
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { themeMode, toggleThemeMode } = useThemeMode();

  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [themeSettingsOpen, setThemeSettingsOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/auth/unauthorized");
    } else {
      setLoading(false);
    }
  }, [status, session, router]);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut({ callbackUrl: "/auth/signin" });
  };

  const handleThemeSettingsClose = () => {
    setThemeSettingsOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          transition: "all 0.3s ease",
        }}
      >
        <CircularProgress
          size={58}
          thickness={4.5}
          sx={{
            color: "#ffffff",
            filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.7))",
            animation: "spin 1.2s linear infinite, pulse-loading 1.5s infinite ease-in-out",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
            "@keyframes pulse-loading": {
              "0%": {
                opacity: 0.7,
                filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
              },
              "50%": {
                opacity: 1,
                filter: "drop-shadow(0 0 16px rgba(255, 255, 255, 0.8))",
              },
              "100%": {
                opacity: 0.7,
                filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
              },
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 2,
              transition: "all 0.3s",
              ...(open && {
                transform: "rotate(180deg)",
              }),
              width: 36,
              height: 36,
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(4px)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              letterSpacing: "0.5px",
              color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : theme.palette.primary.main),
            }}
          >
            Football Analysis System
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title={themeMode === "dark" ? "Chế độ sáng" : "Chế độ tối"} arrow>
              <IconButton
                color="inherit"
                onClick={toggleThemeMode}
                sx={{
                  mr: 1.5,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(4px)",
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  transition: "all 0.15s",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Cài đặt giao diện" arrow>
              <IconButton
                color="inherit"
                onClick={() => setThemeSettingsOpen(true)}
                sx={{
                  mr: 1.5,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(4px)",
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  transition: "all 0.15s",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Thông báo" arrow>
              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
                sx={{
                  mr: 1.5,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(4px)",
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  transition: "all 0.15s",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#ff4d4f",
                      boxShadow: "0 0 0 2px #ffffff55",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Tài khoản" arrow>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                  p: 0.5,
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  transition: "all 0.15s",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {session?.user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: "16px",
            minWidth: 320,
            maxHeight: 400,
            overflow: "auto",
            mt: 1.5,
            border: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.05)}`,
            boxShadow: (theme) =>
              `0 10px 40px -10px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.4 : 0.2)}`,
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Thông báo
          </Typography>
        </Box>
        <MenuItem
          sx={{
            p: 2,
            transition: "background-color 0.15s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
            },
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Có 3 trận đấu mới chờ phân tích
            </Typography>
            <Typography variant="caption" color="text.secondary">
              5 phút trước
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            p: 2,
            transition: "background-color 0.15s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
            },
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Bài viết &quot;Man United vs Liverpool&quot; đã được xuất bản
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 giờ trước
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            p: 2,
            transition: "background-color 0.15s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
            },
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              KTV mới đã đăng ký
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 giờ trước
            </Typography>
          </Box>
        </MenuItem>
        <Box
          sx={{
            p: 1.5,
            borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            textAlign: "center",
          }}
        >
          <Button
            size="small"
            color="primary"
            variant="text"
            sx={{
              borderRadius: "20px",
              px: 2,
              fontSize: "0.75rem",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Xem tất cả
          </Button>
        </Box>
      </Menu>

      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: "16px",
            minWidth: 200,
            mt: 1.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper,
            color: (theme) => theme.palette.text.primary,
            boxShadow: (theme) =>
              `0 10px 40px -10px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.4 : 0.2)}`,
            backdropFilter: "blur(4px)",
            backgroundImage: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))"
                : "none",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            router.push("/admin/profile");
          }}
          sx={{
            p: 2,
            transition: "background-color 0.15s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
            },
          }}
        >
          <ListItemIcon>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {session?.user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </ListItemIcon>
          Hồ sơ
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            router.push("/admin/settings");
          }}
          sx={{
            p: 2,
            transition: "background-color 0.15s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon
              fontSize="small"
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
              }}
            />
          </ListItemIcon>
          Cài đặt
        </MenuItem>
        <Divider sx={{ my: 1, opacity: 0.5 }} />
        <MenuItem
          onClick={handleSignOut}
          sx={{
            p: 2,
            transition: "background-color 0.15s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeft: (theme) => `3px solid ${theme.palette.error.main}`,
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
            },
          }}
        >
          <ListItemIcon>
            <Logout
              fontSize="small"
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
              }}
            />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      <Drawer variant={isMobile ? "temporary" : "permanent"} open={open} onClose={handleDrawerToggle}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            minHeight: 64,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            <Avatar
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                width: 44,
                height: 44,
                mr: open ? 1.5 : 0,
                boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <MatchIcon sx={{ fontSize: 22 }} />
            </Avatar>
            {open && (
              <Typography
                variant="h5"
                component="div"
                sx={{
                  opacity: open ? 1 : 0,
                  fontWeight: "bold",
                  color: "primary.main",
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  transition: theme.transitions.create("opacity", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                }}
              >
                FAS
              </Typography>
            )}
          </Box>
        </Toolbar>
        <Divider sx={{ opacity: 0.5 }} />
        <List sx={{ p: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              disablePadding
              sx={{
                display: "block",
                mb: 0.5,
              }}
            >
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  justifyContent: open ? "initial" : "center",
                  borderRadius: "12px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  "&::before":
                    pathname === item.path
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          background: (theme) =>
                            `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          borderRadius: "4px",
                        }
                      : {},
                  backgroundColor:
                    pathname === item.path
                      ? (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.15 : 0.08)
                      : "transparent",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.05),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: pathname === item.path ? "primary.main" : "text.secondary",
                    transition: "color 0.2s",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    opacity: open ? 1 : 0,
                    "& .MuiTypography-root": {
                      fontWeight: pathname === item.path ? 600 : 400,
                      color: pathname === item.path ? "primary.main" : "text.primary",
                      transition: "color 0.2s, font-weight 0.2s",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mt: "auto", opacity: 0.5 }} />
        {open && (
          <Box sx={{ p: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                backgroundColor: (theme) => theme.palette.background.paper,
                color: (theme) => theme.palette.text.primary,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Cần trợ giúp?
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open("/help", "_blank")}
                sx={{
                  borderRadius: "24px",
                  textTransform: "none",
                  borderWidth: 1.5,
                  px: 3,
                  py: 0.5,
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: "blur(4px)",
                  "&:hover": {
                    borderWidth: 1.5,
                    transform: "translateY(-2px)",
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
              >
                Xem hướng dẫn
              </Button>
            </Paper>
          </Box>
        )}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: "100vh",
          width: `calc(100% - ${open ? drawerWidth : 72}px)`,
          background: (theme) =>
            theme.palette.mode === "light"
              ? "radial-gradient(circle at 50% 14em, #f0f4f8 0%, #f8fafc 100%)"
              : "radial-gradient(circle at 50% 14em, #1e293b 0%, #0f172a 100%)",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Nút Cài đặt giao diện */}
      <ThemeSettings open={themeSettingsOpen} onClose={handleThemeSettingsClose} />
    </Box>
  );
}
