import "./globals.css";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReduxProvider } from '@/redux/Provider';

// Định nghĩa font chính sử dụng trong ứng dụng
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Cải thiện hiệu suất bằng cách hiển thị font swap
  preload: true,
});

export const metadata = {
  title: "Football Analysis",
  description: "Phân tích dữ liệu bóng đá",
};

// Cấu hình để tránh static generation gây lỗi auth session
export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Sử dụng classNames thay vì style trực tiếp để tránh lỗi hydration
  return (
    <html lang="vi" className="light-theme">
      <body className={inter.className}>
        <ReduxProvider>
          <ClientProviders session={session}>
            {children}
          </ClientProviders>
        </ReduxProvider>
      </body>
    </html>
  );
}
