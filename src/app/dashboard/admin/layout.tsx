import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (session?.user?.role !== "admin") {
    redirect("/auth/unauthorized");
  }

  return <>{children}</>;
}
