// src/features/driver/components/forms/FuelForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Common currencies for dropdown
const COMMON_CURRENCIES = [
  { code: "ZAR", name: "ZAR - South African Rand" },
  { code: "ZMW", name: "ZMW - Zambian Kwacha" },
  { code: "USD", name: "USD - US Dollar" },
  { code: "BWP", name: "BWP - Botswana Pula" },
  { code: "NAD", name: "NAD - Namibian Dollar" },
  { code: "MZN", name: "MZN - Mozambican Metical" },
  { code: "AOA", name: "AOA - Angolan Kwanza" },
  { code: "MWK", name: "MWK - Malawian Kwacha" },
  { code: "KES", name: "KES - Kenyan Shilling" },
  { code: "TZS", name: "TZS - Tanzanian Shilling" },
];

export function FuelForm({ manifestId }: { manifestId: string; driverId: string }) {
  const router = useRouter();
  const [liters, setLiters] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [odo, setOdo] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch manifest to get route info (country detection removed as countryId doesn't exist on manifest)
  const { data: manifest } = trpc.driver.getMyTripById.useQuery(
    { manifestId },
    {
      enabled: !!manifestId,
      select: (data) => ({
        location: data.location,
        route: data.route,
      }),
    }
  );

  const createEvent = trpc.driver.createEvent.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (err) => {
      setError(err.message || "Failed to save fuel log");
    },
  });

  async function submit() {
    // Validate numeric inputs
    const litersNum = parseFloat(liters);
    const amountNum = parseFloat(amount);
    const odoNum = odo ? parseFloat(odo) : null;

    if (!liters || isNaN(litersNum) || litersNum <= 0) {
      setError("Please enter a valid number of liters");
      return;
    }
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (odo && (isNaN(odoNum!) || odoNum! <= 0)) {
      setError("Please enter a valid odometer reading");
      return;
    }

    setError(null);
    await createEvent.mutateAsync({
      manifestId,
      type: "fuel",
      payload: {
        liters: litersNum,
        amount: amountNum,
        currency,
        odometer: odoNum,
        timestamp: new Date().toISOString(),
      },
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="liters">Liters</Label>
          <Input
            id="liters"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="pr-20"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {currency}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_CURRENCIES.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {manifest?.route?.name ? `Route: ${manifest.route.name}` : "Select currency for this transaction"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="odometer">Odometer Reading (Optional)</Label>
        <Input
          id="odometer"
          type="number"
          inputMode="numeric"
          min="0"
          value={odo}
          onChange={(e) => setOdo(e.target.value)}
          placeholder="Enter odometer reading"
        />
      </div>

      <Button
        className="w-full mt-6"
        onClick={submit}
        disabled={createEvent.isPending || !liters || !amount}
      >
        {createEvent.isPending ? "Saving..." : "Save Fuel Log"}
      </Button>
    </div>
  );
}
