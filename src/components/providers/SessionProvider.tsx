"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";

export default function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <CssBaseline />
      {children}
    </NextAuthSessionProvider>
  );
}
