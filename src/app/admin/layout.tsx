import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import AdminLayout from "@/components/layouts/AdminLayout";
import { headers } from "next/headers";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  const headersList = headers();
  const path = headersList.get("x-pathname") || "";

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "admin" && session.user.role !== "ktv") {
    redirect("/auth/unauthorized");
  }

  if (session.user.role === "ktv" && path.includes("/admin/users")) {
    redirect("/auth/unauthorized");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
