/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ReactNode, createContext, useState, useEffect, useMemo, useContext } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

// Định nghĩa các kiểu theme màu
type ThemeColorOption = "blue" | "purple" | "teal" | "green" | "amber";

// Mở rộng context
export const ThemeModeContext = createContext({
  toggleThemeMode: () => {},
  themeMode: "light" as PaletteMode,
  themeColor: "blue" as ThemeColorOption,
  setThemeColor: (color: ThemeColorOption) => {},
  isDense: false,
  toggleDensity: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

// Các màu sắc theme - Cải thiện với nhiều màu hơn và tối ưu cho dark mode
const themeColors = {
  blue: {
    light: { main: "#1976d2", dark: "#1565c0" },
    dark: { main: "#90caf9", dark: "#82b1ff" },
  },
  purple: {
    light: { main: "#8b5cf6", dark: "#7c3aed" },
    dark: { main: "#a78bfa", dark: "#b39ddb" },
  },
  teal: {
    light: { main: "#14b8a6", dark: "#0d9488" },
    dark: { main: "#2dd4bf", dark: "#5eead4" },
  },
  green: {
    light: { main: "#10b981", dark: "#059669" },
    dark: { main: "#34d399", dark: "#6ee7b7" }, 
  },
  amber: {
    light: { main: "#f59e0b", dark: "#d97706" },
    dark: { main: "#fbbf24", dark: "#fcd34d" },
  },
};

// CSS toàn cục
const themeStyles = `
  :root {
    --background-light: #f8fafc;
    --text-light: #334155;
    --background-dark: #0a1122;
    --text-dark: #e2e8f0;
  }
  
  .light-theme {
    background-color: var(--background-light);
    color: var(--text-light);
  }
  
  .dark-theme {
    background-color: var(--background-dark);
    color: var(--text-dark);
  }

  /* Hiệu ứng phát sáng cho các phần tử tương tác */
  .dark-theme button:hover, 
  .dark-theme a:hover, 
  .dark-theme .MuiButtonBase-root:hover {
    filter: brightness(1.1) drop-shadow(0 0 3px var(--mui-palette-primary-main));
  }

  /* Cải thiện hiệu ứng chuyển tiếp */
  * {
    transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s !important;
  }
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<PaletteMode>("light");
  const [themeColor, setThemeColor] = useState<ThemeColorOption>("blue");
  const [isDense, setIsDense] = useState<boolean>(false);

  // Đọc cài đặt từ localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("themeMode") as PaletteMode;
      const savedColor = localStorage.getItem("themeColor") as ThemeColorOption;
      const savedDensity = localStorage.getItem("themeDensity");

      if (savedMode) setThemeMode(savedMode);
      if (savedColor && Object.keys(themeColors).includes(savedColor)) {
        setThemeColor(savedColor as ThemeColorOption);
      }
      if (savedDensity) setIsDense(savedDensity === "true");
    } catch (error) {
      console.error("Error reading theme from localStorage:", error);
    }
  }, []);

  // Lưu cài đặt khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem("themeMode", themeMode);
      localStorage.setItem("themeColor", themeColor);
      localStorage.setItem("themeDensity", isDense.toString());
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  }, [themeMode, themeColor, isDense]);

  // Cập nhật class trên document
  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.classList.add("light-theme");
    }
  }, [themeMode]);

  // Hàm toggle theme
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Hàm toggle density
  const toggleDensity = () => {
    setIsDense((prev) => !prev);
  };

  // Tạo theme object cho MUI
  const theme = useMemo(() => {
    const selectedColors = themeColors[themeColor][themeMode];

    return createTheme({
      palette: {
        mode: themeMode,
        primary: {
          main: selectedColors.main,
          dark: selectedColors.dark,
          // Thêm light version
          light: themeMode === "light" 
            ? selectedColors.main + "99" // Thêm độ trong suốt (99 = 60%)
            : selectedColors.main + "bb", // Thêm độ trong suốt nhẹ hơn cho dark mode (bb = 73%)
        },
        secondary: {
          main: themeMode === "light" ? "#d32f2f" : "#f48fb1",
        },
        background: {
          default: themeMode === "light" ? "#f8fafc" : "#0a1122",
          paper: themeMode === "light" ? "#ffffff" : "#111827",
        },
        text: {
          primary: themeMode === "light" ? "#334155" : "#e2e8f0",
          secondary: themeMode === "light" ? "#64748b" : "#94a3b8",
        },
        error: {
          main: themeMode === "light" ? "#d32f2f" : "#ef5350",
        },
        warning: {
          main: themeMode === "light" ? "#ed6c02" : "#ffa726", 
        },
        info: {
          main: themeMode === "light" ? "#0288d1" : "#29b6f6",
        },
        success: {
          main: themeMode === "light" ? "#2e7d32" : "#66bb6a",
        },
      },
      typography: {
        fontSize: isDense ? 13 : 14,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        // Đảm bảo các tiêu đề có màu trắng trong dark mode
        h1: {
          color: themeMode === "dark" ? "#ffffff" : undefined,
          fontWeight: 700,
        },
        h2: {
          color: themeMode === "dark" ? "#ffffff" : undefined,
          fontWeight: 700,
        },
        h3: {
          color: themeMode === "dark" ? "#ffffff" : undefined,
          fontWeight: 700,
        },
        h4: {
          color: themeMode === "dark" ? "#ffffff" : undefined,
          fontWeight: 700,
        },
        h5: {
          color: themeMode === "dark" ? "#ffffff" : undefined,
          fontWeight: 600,
        },
        h6: {
          color: themeMode === "dark" ? "#ffffff" : undefined,
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: themeStyles,
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              ...(themeMode === 'dark' && {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }),
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              ...(themeMode === 'dark' && {
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                backgroundImage: 'none',
              }),
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              ...(themeMode === 'dark' && {
                boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
              }),
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:last-child td, &:last-child th': {
                borderBottom: 0,
              },
              ...(themeMode === 'dark' && {
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }),
            },
          },
        },
        // Đảm bảo tiêu đề trong TableCell cũng có màu trắng trong dark mode
        MuiTableCell: {
          styleOverrides: {
            head: {
              ...(themeMode === 'dark' && {
                color: '#ffffff',
              }),
            },
          },
        },
      },
    });
  }, [themeMode, themeColor, isDense]);

  return (
    <ThemeModeContext.Provider
      value={{
        themeMode,
        toggleThemeMode,
        themeColor,
        setThemeColor,
        isDense,
        toggleDensity,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
