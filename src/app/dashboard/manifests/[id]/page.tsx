// FILE: src/app/dashboard/manifests/[id]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";
import { useMemo } from "react";
// Removed unused Badge import
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManifestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading, error } = trpc.manifest.getById.useQuery({ id });

  const title = useMemo(
    () =>
      data
        ? `Manifest #${data.id.slice(-8)} • ${data.trackingId ?? data.jobNumber ?? ""}`
        : "Manifest",
    [data],
  );

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">{String(error.message)}</div>;
  if (!data) return <div className="p-6">Not found.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/manifests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card><CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div><b>Invoice State:</b> {(data as any).invoiceState?.name ?? "—"}</div>
              <div><b>Route:</b> {(data as any).route?.name ?? "—"}</div>
              <div><b>Location:</b> {(data as any).location?.description ?? "—"}</div>
              <div><b>RMN:</b> {data.rmn ?? "—"}</div>
              <div><b>Job #:</b> {data.jobNumber ?? "—"}</div>
              <div><b>Updated:</b> {data.dateTimeUpdated ? new Date(data.dateTimeUpdated).toLocaleString() : "—"}</div>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="timeline">
          <ManifestTimeline manifestId={id} />
        </TabsContent>

        <TabsContent value="files">
          <ManifestFiles manifestId={id} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditList manifestId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManifestTimeline({ manifestId }: { manifestId: string }) {
  const { data, isLoading } = trpc.manifest.timeline.useQuery({ manifestId });
  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4">
        <h3 className="font-semibold mb-2">Locations</h3>
        <ul className="text-sm space-y-1">
          {data.locations.map((l) => (
            <li key={l.id}>
              {l.recordedAt ? new Date(l.recordedAt).toLocaleString() : "—"} — {l.latitude},{l.longitude}
            </li>
          ))}
        </ul>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <h3 className="font-semibold mb-2">WhatsApp Media</h3>
        <ul className="text-sm space-y-2">
          {data.whatsapp.flatMap((w) =>
            [...w.files, ...w.media].map((m) => (
              <li key={`wm-${w.id}-${m.id}`}>
                <a className="underline" href={"uri" in m ? m.uri : "#"} target="_blank" rel="noreferrer">
                  {"fileName" in m ? m.fileName : m.uri}
                </a>
                {("mimeType" in m && m.mimeType) ? ` (${m.mimeType})` : ""}
              </li>
            )),
          )}
        </ul>
      </CardContent></Card>
    </div>
  );
}

function ManifestFiles({ manifestId }: { manifestId: string }) {
  const utils = trpc.useUtils();
  const getSigned = trpc.manifest.getSignedUpload.useMutation();
  const attach = trpc.manifest.attachMedia.useMutation({
    onSuccess: () => utils.manifest.getById.invalidate({ id: manifestId }),
  });

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = file.name;

    const res = await getSigned.mutateAsync({
      manifestId,
      kind: "media",
      filename,
      contentType: file.type,
    });

    // upload to S3
    await fetch(res.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

    // attach to DB
    await attach.mutateAsync({
      manifestId,
      type: "media",
      fileName: filename,
      uri: res.publicUri,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  }

  return (
    <Card><CardContent className="p-4 space-y-2">
      <input type="file" onChange={onPickFile} />
      <p className="text-xs text-muted-foreground">Files are stored in object storage and linked to this manifest.</p>
      <Button size="sm" variant="secondary" onClick={() => location.reload()}>Refresh</Button>
    </CardContent></Card>
  );
}

function AuditList({ manifestId }: { manifestId: string }) {
  const { data, isLoading } = trpc.manifest.audit.useQuery({ manifestId, limit: 50 });
  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!data?.length) return <div className="p-4 text-sm">No audit entries.</div>;
  const auditData = data as unknown as Array<{ id: string; action: string; createdAt: string; newValues: string }>;
  return (
    <Card><CardContent className="p-4">
      <ul className="space-y-2 text-sm">
        {auditData.map((a) => (
          <li key={a.id}>
            <div className="font-medium">{a.action} • {new Date(a.createdAt).toLocaleString()}</div>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{JSON.stringify(JSON.parse(a.newValues), null, 2)}</pre>
          </li>
        ))}
      </ul>
    </CardContent></Card>
  );
}
