"use client";

import { ReactNode } from "react";
import { Session } from "next-auth";

// Wrapper bọc bên ngoài SessionProvider để truyền dữ liệu từ Server Components
export default function NextAuthProvider({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return children;
}
