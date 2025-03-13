import "./globals.css";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Định nghĩa font chính sử dụng trong ứng dụng
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Football Analysis",
  description: "Phân tích dữ liệu bóng đá",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Sử dụng classNames thay vì style trực tiếp để tránh lỗi hydration
  return (
    <html lang="vi" className="light-theme">
      <body className={inter.className}>
        <ClientProviders session={session}>{children}</ClientProviders>
      </body>
    </html>
  );
}
