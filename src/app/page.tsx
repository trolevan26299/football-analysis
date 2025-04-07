import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role === "admin") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/matches");
  }
}
