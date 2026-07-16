"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";

export interface SettingsFormValues {
  exchangeRateBobPerUsd: number;
  annualInterestRatePercent: number;
  minDownPaymentPercent: number;
  maxDownPaymentPercent: number;
  defaultDownPaymentPercent: number;
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof SettingsFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: Number(value) }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="font-semibold">Tipo de cambio</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            El BCB no tiene una API pública confiable, así que este valor se actualiza a mano cuando cambie.
          </p>
          <div className="mt-3">
            <Label htmlFor="exchangeRateBobPerUsd">Bolivianos por 1 USD</Label>
            <Input
              id="exchangeRateBobPerUsd"
              type="number"
              step="0.0001"
              min="0"
              required
              value={values.exchangeRateBobPerUsd}
              onChange={(e) => update("exchangeRateBobPerUsd", e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="font-semibold">Financiamiento</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tasa e intervalo de cuota inicial que usa la calculadora de crédito del sitio público.
          </p>
          <div className="mt-3">
            <Label htmlFor="annualInterestRatePercent">Tasa de interés anual (%)</Label>
            <Input
              id="annualInterestRatePercent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              value={values.annualInterestRatePercent}
              onChange={(e) => update("annualInterestRatePercent", e.target.value)}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minDownPaymentPercent">Cuota inicial mínima (%)</Label>
              <Input
                id="minDownPaymentPercent"
                type="number"
                step="1"
                min="0"
                max="100"
                required
                value={values.minDownPaymentPercent}
                onChange={(e) => update("minDownPaymentPercent", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="defaultDownPaymentPercent">Por defecto (%)</Label>
              <Input
                id="defaultDownPaymentPercent"
                type="number"
                step="1"
                min="0"
                max="100"
                required
                value={values.defaultDownPaymentPercent}
                onChange={(e) => update("defaultDownPaymentPercent", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxDownPaymentPercent">Cuota inicial máxima (%)</Label>
              <Input
                id="maxDownPaymentPercent"
                type="number"
                step="1"
                min="0"
                max="100"
                required
                value={values.maxDownPaymentPercent}
                onChange={(e) => update("maxDownPaymentPercent", e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && !error && <p className="text-sm text-emerald-600">Guardado.</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </Card>
  );
}
