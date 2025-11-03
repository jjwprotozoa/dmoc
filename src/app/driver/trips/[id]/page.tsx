// src/app/driver/trips/[id]/page.tsx
// Trip detail page with map, stops, and quick actions - uses tRPC with driver access control

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TripDetailView } from "@/features/driver/components/TripDetailView";

export default async function TripDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DRIVER") {
    redirect("/sign-in");
  }

  return <TripDetailView manifestId={params.id} />;
}
