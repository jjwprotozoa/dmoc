// src/features/driver/components/forms/MediaForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MediaForm({ manifestId, driverId }: { manifestId: string; driverId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createEvent = trpc.driver.createEvent.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (err) => {
      setError(err.message || "Failed to attach media");
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
    if (files.length === 0 && !note.trim()) {
      setError("Please attach a file or add a note");
      return;
    }

    setError(null);
    
    // TODO: Upload files to storage (MinIO/S3) and get URIs
    // For now, store file names - actual upload to be implemented
    await createEvent.mutateAsync({
      manifestId,
      type: "note",
      payload: { 
        note, 
        files: files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          // TODO: Add uploaded URI after file upload
        })) 
      },
    });
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="space-y-1">
        <Label>Photo/Video</Label>
        <input 
          type="file" 
          multiple 
          accept="image/*,video/*" 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        {files.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Note</Label>
        <Textarea 
          value={note} 
          onChange={e => setNote(e.target.value)} 
          placeholder="e.g. plate photo, receipt, cargo seal" 
        />
      </div>
      <Button 
        className="w-full" 
        type="submit"
        disabled={createEvent.isPending}
      >
        {createEvent.isPending ? "Attaching..." : "Attach"}
      </Button>
    </form>
  );
}

