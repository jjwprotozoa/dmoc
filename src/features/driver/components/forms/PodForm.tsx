// src/features/driver/components/forms/PodForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PodForm({ manifestId }: { manifestId: string; driverId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createEvent = trpc.driver.createEvent.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (err) => {
      setError(err.message || "Failed to confirm delivery");
    },
  });

  async function submit() {
    if (!name.trim()) {
      setError("Please enter recipient name");
      return;
    }

    setError(null);
    await createEvent.mutateAsync({
      manifestId,
      type: "pod",
      payload: { 
        recipient: name, 
        pin: pin || undefined, 
        timestamp: new Date().toISOString() 
      },
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div><Label>Recipient name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><Label>Optional PIN/OTP</Label><Input inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} /></div>
      <Button 
        className="w-full" 
        onClick={submit}
        disabled={createEvent.isPending}
      >
        {createEvent.isPending ? "Confirming..." : "Confirm delivery"}
      </Button>
    </div>
  );
}

