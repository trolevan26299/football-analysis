import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import AdminLayout from "@/components/layouts/AdminLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/auth/unauthorized");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
