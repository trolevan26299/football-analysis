import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import AdminLayout from "@/components/layouts/AdminLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // Người dùng bình thường vẫn có thể xem bài viết phân tích
  // nên chúng ta không kiểm tra role như trong admin/layout.tsx

  return <AdminLayout>{children}</AdminLayout>;
} 