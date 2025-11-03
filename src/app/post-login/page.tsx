// src/app/post-login/page.tsx
// Post-login routing page that redirects users based on their role

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function PostLogin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  const role = session.user.role;
  
  // Drivers go to /driver
  if (role === "DRIVER") {
    redirect("/driver");
  }

  // All other roles go to /dashboard
  redirect("/dashboard");
}

