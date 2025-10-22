// src/app/dashboard/manifests/page.tsx
"use client";
import { useState } from "react";
import { api } from "@/lib/trpc";

export default function ManifestsPage() {
  // Feature flag check
  if (process.env.NEXT_PUBLIC_DMOC_MIGRATION !== "1") return null;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const { data, isLoading, error } = api.manifest.list.useQuery({ 
    q, 
    status, 
    take: 50, 
    skip: 0 
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Manifests (DMOC migration)</h1>

      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {/* Simple status filter buttons */}
        {["SCHEDULED","IN_PROGRESS","COMPLETED","CANCELLED"].map(s => (
          <button
            key={s}
            onClick={() =>
              setStatus((prev) => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])
            }
            className={`px-2 py-1 rounded border ${status.includes(s) ? "bg-gray-200" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error.message}</div>}

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Company</th>
              <th className="text-left p-2">Scheduled</th>
              <th className="text-left p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2">
                  <a className="underline" href={`/dashboard/manifests/${m.id}`}>{m.title ?? m.id}</a>
                </td>
                <td className="p-2">{m.status}</td>
                <td className="p-2">{m.company?.name ?? "-"}</td>
                <td className="p-2">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "-"}</td>
                <td className="p-2">{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!isLoading && !error && data?.items?.length === 0 && (
              <tr><td className="p-4 italic" colSpan={5}>No manifests found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600">
        Total: {data?.total ?? 0}
      </div>
    </div>
  );
}
