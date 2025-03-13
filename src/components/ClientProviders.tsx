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
import { Box, CircularProgress, Fade } from "@mui/material";

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
    </Fade>
  );
}
