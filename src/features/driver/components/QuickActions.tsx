// src/features/driver/components/QuickActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function QuickActions({ manifestId }: { manifestId: string }) {
  const r = useRouter();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" onClick={() => r.push(`/driver/trips/${manifestId}/incident`)}>Report incident</Button>
      <Button variant="secondary" onClick={() => r.push(`/driver/trips/${manifestId}/fuel`)}>Log fuel</Button>
      <Button variant="secondary" onClick={() => r.push(`/driver/trips/${manifestId}/media`)}>Add photo</Button>
      <Button onClick={() => r.push(`/driver/trips/${manifestId}/pod`)}>Proof of delivery</Button>
    </div>
  );
}

