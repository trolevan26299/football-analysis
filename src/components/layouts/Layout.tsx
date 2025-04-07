/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useThemeMode } from "@/theme/theme";
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

// Lazy load icons để giảm kích thước bundle
import dynamic from "next/dynamic";
const DarkModeIcon = dynamic(() => import("@mui/icons-material/DarkMode"), { ssr: false });
const LightModeIcon = dynamic(() => import("@mui/icons-material/LightMode"), { ssr: false });
const DocumentScannerIcon = dynamic(() => import("@mui/icons-material/DocumentScanner"), { ssr: false });
const LeagueIcon = dynamic(() => import("@mui/icons-material/EmojiEvents"), { ssr: false });
const MatchIcon = dynamic(() => import("@mui/icons-material/SportsSoccer"), { ssr: false });
const SettingsIcon = dynamic(() => import("@mui/icons-material/Settings"), { ssr: false });
const UserIcon = dynamic(() => import("@mui/icons-material/Person"), { ssr: false });
const LogoutIcon = dynamic(() => import("@mui/icons-material/Logout"), { ssr: false });

import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  Drawer as MuiDrawer,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { alpha, CSSObject, styled, Theme } from "@mui/material/styles";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useState } from "react";

// Sử dụng dynamic import để lazy load component ThemeSettings
const ThemeSettings = dynamic(() => import("@/components/ui/ThemeSettings"), {
  loading: () => <div style={{ width: 300, height: 400 }}></div>,
  ssr: false
});

const drawerWidth = 240;

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: {
    title: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

// Định nghĩa các mục menu - cached để tránh tạo lại giữa các lần render
const menuItems: MenuItem[] =[
  {
    title: "Quản lý trận đấu",
    path: "/dashboard/matches",
    icon: <MatchIcon />,
  },
  {
    title: "Quản lý giải đấu",
    path: "/dashboard/leagues",
    icon: <LeagueIcon />,
  },
  {
    title: "Bài phân tích",
    path: "/dashboard/articles",
    icon: <DocumentScannerIcon />,
  },
];
const menuItemsAdmin: MenuItem[]  = [
  {
    title: "Dashboard",
    path: "/dashboard/admin",
    icon: <DashboardIcon />,
  },
   ...menuItems,
   {
    title: "Quản lý người dùng",
    path: "/dashboard/admin/users",
    icon: <UserIcon />,
  }

];

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

// Memo các component con để tránh re-render không cần thiết
const MemoizedAppBar = memo(styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.8) : alpha("#fff", 0.9),
  color: theme.palette.text.primary,
  backdropFilter: "blur(12px)",
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
})));

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  backgroundColor:
    theme.palette.mode === "light" ? "#fff" : theme.palette.background.paper,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
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

// Memo các component con để tránh re-render không cần thiết
const MemoizedDrawer = memo(styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
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
  })
));

// Memo LoadingSpinner component
const LoadingSpinner = memo(function LoadingSpinner() {
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
        }}
      />
    </Box>
  );
});

// Memo để tránh re-render không cần thiết
function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { themeMode, toggleThemeMode } = useThemeMode();

  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [themeSettingsOpen, setThemeSettingsOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
     setLoading(false);
  }, [session, router]);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSignOut = useCallback(() => {
    handleMenuClose();
    signOut({ callbackUrl: "/auth/signin" });
  }, [handleMenuClose]);

  const handleThemeSettingsClose = useCallback(() => {
    setThemeSettingsOpen(false);
  }, []);

  const handleSubMenuToggle = useCallback((index: number) => {
    setSubMenuOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <MemoizedAppBar position="fixed" open={open}>
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

          {/* Nút chuyển đổi chế độ theme */}
          <IconButton
            onClick={toggleThemeMode}
            color="inherit"
            sx={{
              mx: 1,
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(4px)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Nút setting */}
          <IconButton
            color="inherit"
            onClick={() => setThemeSettingsOpen(true)}
            sx={{
              mx: 1,
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(4px)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <SettingsIcon />
          </IconButton>

          {/* Avatar và menu người dùng */}
          <Tooltip title={`Xin chào ${session?.user?.username || 'Admin'}`}>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                ml: 1,
                width: 40,
                height: 40,
                borderRadius: "12px",
                border: (theme) =>
                  `2px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: (theme) => theme.palette.primary.main,
                  color: "#fff",
                }}
              >
                {session?.user?.username?.charAt(0).toUpperCase() || "A"}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: 180,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.9) : alpha("#fff", 0.9),
                backdropFilter: "blur(8px)",
                overflow: "visible",
                mt: 1.5,
                border: (theme) =>
                  `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {session?.user?.username || "Admin"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.user?.role === "admin" ? "Quản trị viên" : "Kỹ thuật viên"}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={handleSignOut}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </MemoizedAppBar>

      <MemoizedDrawer variant="permanent" open={open}>
        <Toolbar />
        <Divider />
        <List
          sx={{
            mt: 2,
            px: 2,
          }}
        >
          {(session?.user?.role === "admin" ? menuItemsAdmin : menuItems).map((item, index) => (
            <React.Fragment key={item.path || index}>
              <ListItem
                disablePadding
                sx={{
                  display: "block",
                  mb: 1,
                }}
              >
                {item.children ? (
                  <ListItemButton
                    onClick={() => handleSubMenuToggle(index)}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      justifyContent: open ? "initial" : "center",
                      borderRadius: "12px",
                      backgroundColor:
                        subMenuOpen[index] || item.path?.startsWith(item.path || "")
                          ? (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.15 : 0.08)
                          : "transparent",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.15),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: "text.primary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      sx={{
                        opacity: open ? 1 : 0,
                        "& .MuiTypography-root": {
                          fontWeight: 400,
                          color: "text.primary",
                          transition: "color 0.2s, font-weight 0.2s",
                        },
                      }}
                    />
                    {open && (subMenuOpen[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </ListItemButton>
                ) : (
                  <div 
                    onClick={() => item.path && router.push(item.path as any)}
                    style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
                  >
                    <ListItemButton
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
                            alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.15),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                          color:
                            pathname === item.path ? "primary.main" : "text.primary",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        sx={{
                          opacity: open ? 1 : 0,
                          "& .MuiTypography-root": {
                            fontWeight: pathname === item.path ? 500 : 400,
                            color: pathname === item.path ? "primary.main" : "text.primary",
                            transition: "color 0.2s, font-weight 0.2s",
                          },
                        }}
                      />
                    </ListItemButton>
                  </div>
                )}
              </ListItem>

              {item.children && open && subMenuOpen[index] && (
                <Box sx={{ pl: 2 }}>
                  {item.children.map((child) => (
                    <ListItem
                      key={child.path}
                      disablePadding
                      sx={{
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      <div 
                        onClick={() => router.push(child.path as any)}
                        style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
                      >
                        <ListItemButton
                          sx={{
                            minHeight: 40,
                            px: 2.5,
                            ml: 2,
                            justifyContent: "initial",
                            borderRadius: "12px",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.2s",
                            "&::before":
                              pathname === child.path
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
                              pathname === child.path
                                ? (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.15 : 0.08)
                                : "transparent",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.15),
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: 3,
                              justifyContent: "center",
                              color:
                                pathname === child.path ? "primary.main" : "text.primary",
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            sx={{
                              "& .MuiTypography-root": {
                                fontWeight: pathname === child.path ? 500 : 400,
                                color: pathname === child.path ? "primary.main" : "text.primary",
                                transition: "color 0.2s, font-weight 0.2s",
                              },
                            }}
                          />
                        </ListItemButton>
                      </div>
                    </ListItem>
                  ))}
                </Box>
              )}
            </React.Fragment>
          ))}
        </List>
      </MemoizedDrawer>

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

      {themeSettingsOpen && <ThemeSettings open={themeSettingsOpen} onClose={handleThemeSettingsClose} />}
    </Box>
  );
}

export default memo(Layout);
