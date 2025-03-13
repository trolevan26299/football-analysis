"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { ErrorOutline as ErrorIcon } from "@mui/icons-material";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Tự động chuyển về trang đăng nhập sau 5 giây
    const timer = setTimeout(() => {
      router.push("/auth/signin");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            width: "100%",
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Không có quyền truy cập
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Bạn không có quyền truy cập vào trang này. Hệ thống sẽ tự động chuyển về trang đăng nhập sau 5 giây.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/auth/signin")} sx={{ mt: 2 }}>
            Quay lại trang đăng nhập
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
