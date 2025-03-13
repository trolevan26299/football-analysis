"use client";
import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeProvider } from "@/theme/theme";
import { Session } from "next-auth";
import { Box, CircularProgress, Fade, Typography } from "@mui/material";

// Tạo emotion cache cho Material UI với SSR
export function createEmotionCache() {
  return createCache({ key: "css" });
}

export default function ClientProviders({ children, session }: { children: React.ReactNode; session: Session | null }) {
  // Tạo emotion cache riêng cho mỗi request để tránh xung đột
  const [{ cache, flush }] = useState(() => {
    const cache = createEmotionCache();
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  // State quản lý loading khi chuyển trang
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lưu pathname và searchParams trước đó
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);

  // Theo dõi thay đổi route để hiển thị loading
  useEffect(() => {
    // Kiểm tra xem route có thực sự thay đổi không
    const currentUrl = pathname + searchParams.toString();
    const previousUrl = prevPathname + prevSearchParams.toString();

    if (currentUrl !== previousUrl) {
      // Route đã thay đổi, tắt loading sau một khoảng thời gian ngắn
      setTimeout(() => {
        setIsRouteChanging(false);
        // Cập nhật các giá trị trước đó
        setPrevPathname(pathname);
        setPrevSearchParams(searchParams);
      }, 300); // Delay để tránh nhấp nháy
    }
  }, [pathname, searchParams, prevPathname, prevSearchParams]);

  // Hàm bắt đầu loading khi click vào các liên kết
  const startRouteChangeLoading = useCallback(() => {
    // Chỉ hiển thị loading nếu người dùng đang thực sự chuyển sang một route khác
    const currentUrl = pathname + searchParams.toString();
    if (window.location.pathname + window.location.search !== currentUrl) {
      setIsRouteChanging(true);
    }
  }, [pathname, searchParams]);

  // Đăng ký sự kiện click cho tất cả các liên kết trong ứng dụng
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      // Nếu là link nội bộ (không mở tab mới và không có thuộc tính download)
      if (
        link &&
        !link.target &&
        !link.hasAttribute("download") &&
        (!link.href || link.href.startsWith(window.location.origin))
      ) {
        // Kiểm tra xem liên kết có thực sự dẫn đến một trang khác không
        const hrefPath = new URL(link.href, window.location.origin).pathname;
        const hrefSearch = new URL(link.href, window.location.origin).search;

        if (hrefPath !== pathname || hrefSearch !== searchParams.toString()) {
          startRouteChangeLoading();
        }
      }
    };

    // Đăng ký sự kiện click trên toàn bộ document
    document.addEventListener("click", handleLinkClick);

    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, [startRouteChangeLoading, pathname, searchParams]);

  // Đăng ký sự kiện khi sử dụng router.push() hoặc router.replace()
  useEffect(() => {
    // Ghi đè phương thức history.pushState
    const originalPushState = history.pushState;
    history.pushState = function (...args: Parameters<typeof originalPushState>) {
      startRouteChangeLoading();
      return originalPushState.apply(this, args);
    };

    // Ghi đè phương thức history.replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args: Parameters<typeof originalReplaceState>) {
      startRouteChangeLoading();
      return originalReplaceState.apply(this, args);
    };

    // Sự kiện khi người dùng nhấn nút back/forward của trình duyệt
    window.addEventListener("popstate", startRouteChangeLoading);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", startRouteChangeLoading);
    };
  }, [startRouteChangeLoading]);

  // Xử lý việc thêm CSS vào HTML từ server
  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return <style data-emotion={`${cache.key} ${names.join(" ")}`} dangerouslySetInnerHTML={{ __html: styles }} />;
  });

  return (
    <CacheProvider value={cache}>
      <SessionProvider session={session}>
        <ThemeProvider>
          <CssBaseline />
          {/* Loading indicator toàn cục */}
          <GlobalLoadingIndicator isLoading={isRouteChanging} />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}

// Component loading toàn cục
function GlobalLoadingIndicator({ isLoading }: { isLoading: boolean }) {
  return (
    <Fade in={isLoading} unmountOnExit timeout={300}>
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
          backdropFilter: "blur(12px)",
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(10, 17, 34, 0.75)'
              : 'rgba(255, 255, 255, 0.75)',
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 2,
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark'
                ? 'rgba(17, 24, 39, 0.6)' 
                : 'rgba(255, 255, 255, 0.6)',
            boxShadow: (theme) => 
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Hiệu ứng sáng xoay */}
          <Box 
            sx={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              background: (theme) => `radial-gradient(circle, ${theme.palette.primary.main}30 0%, transparent 70%)`,
              top: '-100px',
              left: '-100px',
              opacity: 0.7,
              animation: 'rotate 10s linear infinite',
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
              zIndex: -1,
            }}
          />
          
          <CircularProgress
            size={60}
            thickness={4.5}
            sx={{
              color: (theme) => 
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
              filter: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
                  : 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))',
              animation: "spin 1.2s linear infinite, pulse-loading 1.5s infinite ease-in-out",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
              "@keyframes pulse-loading": {
                "0%": {
                  opacity: 0.7,
                  transform: 'scale(0.98)',
                },
                "50%": {
                  opacity: 1,
                  transform: 'scale(1.02)',
                },
                "100%": {
                  opacity: 0.7,
                  transform: 'scale(0.98)',
                },
              },
            }}
          />
          
          <Typography
            sx={{
              marginTop: 2,
              color: 'text.primary',
              fontWeight: 500,
              animation: 'fadeText 2s infinite ease-in-out',
              '@keyframes fadeText': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 },
              }
            }}
          >
            Đang tải...
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
}
