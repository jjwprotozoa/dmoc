// FILE: src/app/dashboard/manifests/page.tsx
// All manifests page using the new ManifestTable component

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { ManifestTable } from "./_components/ManifestTable";

export default function ManifestsPage() {
  console.log('🔍 [Client] ManifestsPage component mounted');
  
  // Feature flag check
  if (process.env.NEXT_PUBLIC_DMOC_MIGRATION !== "1") {
    console.log('⚠️ [Client] Migration feature disabled');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Migration Feature Disabled</h3>
              <p className="text-muted-foreground">
                Set NEXT_PUBLIC_DMOC_MIGRATION=1 to enable this page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ [Client] Migration feature enabled, rendering manifests page');
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manifests</h1>
          <p className="text-muted-foreground">
            Manage your logistics manifests and track deliveries
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="/dashboard/manifests/card-view"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Card View
          </a>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Manifest
          </Button>
        </div>
      </div>

      {/* Manifest Table */}
      <ManifestTable title="All Manifests" />
    </div>
  );
}