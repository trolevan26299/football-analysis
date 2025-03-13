/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
  Avatar,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { alpha } from "@mui/material/styles";

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError("Email hoặc mật khẩu không chính xác");
        setLoading(false);
      } else {
        router.push("/admin");
      }
    } catch (_) {
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 3,
          width: "100%",
          textAlign: "center",
          backgroundColor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => `0 0 10px rgba(0, 0, 0, ${theme.palette.mode === "light" ? 0.1 : 0.2})`,
        }}
      >
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.9),
              boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <SportsSoccerIcon sx={{ fontSize: 40 }} />
          </Avatar>
        </Box>

        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
          Đăng nhập
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: "left" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Tên tài khoản"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
          </Button>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link href="/auth/forgot-password" variant="body2">
              Quên mật khẩu?
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
