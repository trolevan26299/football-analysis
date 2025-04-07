import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import LayoutMain from "@/components/layouts/Layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return <LayoutMain>{children}</LayoutMain>;
} 