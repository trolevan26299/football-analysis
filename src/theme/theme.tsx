/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ReactNode, createContext, useState, useEffect, useMemo, useContext } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

// Định nghĩa các kiểu theme màu
type ThemeColorOption = "blue" | "purple" | "teal";

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

// Các màu sắc theme
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
};

// CSS toàn cục
const themeStyles = `
  :root {
    --background-light: #f8fafc;
    --text-light: #334155;
    --background-dark: #0f172a;
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
      if (savedColor && ["blue", "purple", "teal"].includes(savedColor)) {
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
        },
        secondary: {
          main: themeMode === "light" ? "#d32f2f" : "#f48fb1",
        },
        background: {
          default: themeMode === "light" ? "#f8fafc" : "#0f172a",
          paper: themeMode === "light" ? "#ffffff" : "#1e293b",
        },
        text: {
          primary: themeMode === "light" ? "#334155" : "#e2e8f0",
          secondary: themeMode === "light" ? "#64748b" : "#94a3b8",
        },
      },
      typography: {
        fontSize: isDense ? 13 : 14,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: themeStyles,
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
