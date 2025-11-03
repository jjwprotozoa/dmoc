// src/features/driver/components/forms/IncidentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

const INCIDENT_CAUSED_BY = [
  "DRIVER",
  "HORSE",
  "LOGISTICS OFFICER",
  "TRANSPORTER",
] as const;

const SEVERITY_LEVELS = [
  "INFO",
  "LOW",
  "MEDIUM",
  "HIGH",
  "SERIOUS",
] as const;

const REASONS_FOR_INCIDENT = [
  "ACCIDENT",
  "ARMED ROBBERY",
  "AWOL",
  "BREAK OF CONVOY",
  "BREAKDOWN",
  "CARRYING PASSENGERS",
  "CONNIVING",
  "DESERTER",
  "DRIVER CARGO DOCUMENTS EXPIRED",
  "DRIVER LOST CARGO DOCUMENTS",
  "DRIVER PERSONAL DOCUMENTS EXPIRED",
  "DRIVER REFUSED TO SUBMIT DOCUMENT",
  "DRIVING UNDER THE INFLUENCE",
  "FILLING STATION",
  "INSUBORDINATION",
  "INTERFERENCE BY POLICE",
  "LATE",
  "LOCATION DANGEROUS",
  "MOVING AT NIGHT",
  "MOVING WITHOUT SECURITY",
  "NOT ANSWERING PHONE",
  "NOT TRACKING",
  "OFFICER LOST CARGO DOCUMENTS",
  "OVERWEIGHT ADJUSTMENT",
  "PARKING LOCATION",
  "RAN OUT OF FUEL",
  "REFUSED TO PARK",
  "ROUTE CLOSED",
  "SUSPICIOUS BEHAVIOUR",
  "THEFT",
  "TRACKER LOST",
  "UNDER INFLUENCE",
  "WAITING FOR DOCUMENTS",
  "WAITING FOR FUEL",
  "WAITING FOR MECHANIC",
  "WAITING FOR MONEY",
  "WAITING FOR SPARE PARTS",
  "WRECKLESS DRIVING",
] as const;

export function IncidentForm({ manifestId, driverId: _driverId }: { manifestId: string; driverId: string }) {
  const router = useRouter();
  const [causedBy, setCausedBy] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // tRPC mutation - backend enforces driver access control
  const createEvent = trpc.driver.createEvent.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (err) => {
      setError(err.message || "Failed to submit incident");
    },
  });

  async function submit() {
    // Validate required fields
    if (!causedBy) {
      setError("Please select who caused the incident");
      return;
    }
    if (!severity) {
      setError("Please select the severity level");
      return;
    }
    if (!reason) {
      setError("Please select the reason for the incident");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }

    setError(null);
    await createEvent.mutateAsync({
      manifestId,
      type: "incident",
      payload: {
        causedBy,
        severity,
        reason,
        description: description.trim(),
      },
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="causedBy" className="text-base font-semibold">
          1️⃣ Incident Caused By
        </Label>
        <p className="text-xs text-gray-500 mb-2">Defines who was responsible for the incident</p>
        <Select value={causedBy} onValueChange={setCausedBy}>
          <SelectTrigger id="causedBy">
            <SelectValue placeholder="Select responsible party" />
          </SelectTrigger>
          <SelectContent>
            {INCIDENT_CAUSED_BY.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity" className="text-base font-semibold">
          2️⃣ Severity Level of Incident
        </Label>
        <p className="text-xs text-gray-500 mb-2">Defines the seriousness or priority level</p>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger id="severity">
            <SelectValue placeholder="Select severity level" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-base font-semibold">
          3️⃣ Reason for Incident
        </Label>
        <p className="text-xs text-gray-500 mb-2">Describes the cause or nature of the incident</p>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {REASONS_FOR_INCIDENT.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">
          Additional Details
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide additional details about the incident..."
          rows={4}
          className="resize-none"
        />
      </div>

      <Button
        className="w-full mt-6"
        onClick={submit}
        disabled={createEvent.isPending || !causedBy || !severity || !reason || !description.trim()}
      >
        {createEvent.isPending ? "Submitting..." : "Submit Incident Report"}
      </Button>
    </div>
  );
}
