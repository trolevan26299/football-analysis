import { redirect } from "next/navigation";
import { getServerAuthSession, isKTV } from "@/lib/auth";

export default async function KTVPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (!isKTV(session)) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Trang KTV</h1>
      <p>Chào mừng KTV đã đăng nhập vào hệ thống phân tích bóng đá.</p>
    </div>
  );
}
