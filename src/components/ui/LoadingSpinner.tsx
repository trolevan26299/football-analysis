"use client";
import { Box, CircularProgress, Typography, Backdrop, Paper, LinearProgress, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";

// Animation cho pulse effect
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

interface LoadingSpinnerProps {
  // Các props chính
  loading?: boolean;
  message?: string;

  // Kiểu hiển thị
  variant?: "circular" | "linear" | "overlay" | "skeleton";

  // Kích thước và màu sắc
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "inherit";

  // Props cho overlay
  blur?: boolean;

  // Props cho skeleton
  height?: number | string;
  width?: number | string;

  // Custom styles
  className?: string;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loading = true,
  message = "Đang tải...",
  variant = "circular",
  size = "medium",
  color = "primary",
  blur = true,
  height,
  width,
  className,
  style,
}) => {
  const theme = useTheme();

  // Xác định kích thước dựa trên prop size
  const getSize = () => {
    switch (size) {
      case "small":
        return 24;
      case "large":
        return 56;
      default:
        return 40;
    }
  };

  // Component cho Skeleton loading
  const SkeletonLoading = () => (
    <Box
      sx={{
        width: width || "100%",
        height: height || "100px",
        backgroundColor: theme.palette.grey[200],
        borderRadius: 1,
        animation: `${pulse} 1.5s ease-in-out infinite`,
      }}
    />
  );

  // Component cho Circular loading
  const CircularLoading = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
      className={className}
      style={style}
    >
      <CircularProgress color={color} size={getSize()} thickness={4} />
      {message && (
        <Typography variant={size === "small" ? "caption" : "body2"} color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  // Component cho Linear loading
  const LinearLoading = () => (
    <Box sx={{ width: "100%" }} className={className} style={style}>
      <LinearProgress color={color} />
      {message && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  // Component cho Overlay loading
  const OverlayLoading = () => (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: blur ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.5)",
        backdropFilter: blur ? "blur(3px)" : "none",
      }}
      open={loading}
    >
      <Paper
        elevation={blur ? 4 : 0}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 3,
          backgroundColor: blur ? "rgba(255, 255, 255, 0.9)" : "transparent",
          minWidth: 200,
        }}
      >
        <CircularProgress color={color} size={getSize()} />
        {message && (
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              color: blur ? "text.primary" : "white",
            }}
          >
            {message}
          </Typography>
        )}
      </Paper>
    </Backdrop>
  );

  if (!loading) return null;

  switch (variant) {
    case "linear":
      return <LinearLoading />;
    case "overlay":
      return <OverlayLoading />;
    case "skeleton":
      return <SkeletonLoading />;
    default:
      return <CircularLoading />;
  }
};

// Helper components cho dễ sử dụng
export const CircularSpinner = (props: Omit<LoadingSpinnerProps, "variant">) => (
  <LoadingSpinner {...props} variant="circular" />
);

export const LinearSpinner = (props: Omit<LoadingSpinnerProps, "variant">) => (
  <LoadingSpinner {...props} variant="linear" />
);

export const OverlaySpinner = (props: Omit<LoadingSpinnerProps, "variant">) => (
  <LoadingSpinner {...props} variant="overlay" />
);

export const SkeletonLoader = (props: Omit<LoadingSpinnerProps, "variant">) => (
  <LoadingSpinner {...props} variant="skeleton" />
);

export default LoadingSpinner;
