// src/app/driver/layout.tsx
// Driver app layout with header and container matching dashboard theme

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DriverHeader } from "@/features/driver/components/DriverHeader";
import { DriverBottomNav } from "@/features/driver/components/DriverBottomNav";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BackToTop } from "@/components/ui/back-to-top";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const { role, name, tenantSlug } = session.user;
  // middleware already guards, but double-check:
  if (role !== "DRIVER") redirect("/dashboard");

  return (
    <ThemeProvider initialTenantSlug={tenantSlug || "digiwize"}>
      <div className="min-h-screen bg-gray-50">
        <DriverHeader name={name ?? "Driver"} email={session.user.email ?? ""} tenantSlug={tenantSlug || "digiwize"} />
        <main className="pb-16 lg:pb-0">
          <div className="p-6">{children}</div>
        </main>
        <DriverBottomNav />
        <BackToTop />
      </div>
    </ThemeProvider>
  );
}

