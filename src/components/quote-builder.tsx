"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { computeQuote, type QuoteResult } from "@/lib/quote";
import { computeFrenchAmortization, AVAILABLE_TERM_MONTHS } from "@/lib/amortization";
import { formatBob, formatUsd, formatUsd2dp } from "@/lib/format";

export interface HouseModelDTO {
  id: string;
  name: string;
  tagline: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: number;
  pricePerM2Usd: number;
  hasImage: boolean;
}

export interface RoofUpgradeDTO {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  hasImage: boolean;
}

export interface AccessoryDTO {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  hasImage: boolean;
}

export interface SettingsDTO {
  exchangeRateBobPerUsd: number;
  annualInterestRatePercent: number;
  minDownPaymentPercent: number;
  maxDownPaymentPercent: number;
  defaultDownPaymentPercent: number;
}

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const EMPTY_CONTACT: ContactInfo = { name: "", phone: "", email: "", notes: "" };

export function QuoteBuilder({
  houseModels,
  roofUpgrades,
  accessories,
  settings,
}: {
  houseModels: HouseModelDTO[];
  roofUpgrades: RoofUpgradeDTO[];
  accessories: AccessoryDTO[];
  settings: SettingsDTO;
}) {
  const [houseModelId, setHouseModelId] = useState(houseModels[0]?.id ?? "");
  const [roofUpgradeId, setRoofUpgradeId] = useState(roofUpgrades[0]?.id ?? "");
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CONTADO" | "FINANCIADO">("CONTADO");
  const [downPaymentPercent, setDownPaymentPercent] = useState(settings.defaultDownPaymentPercent);
  const [termMonths, setTermMonths] = useState<number>(AVAILABLE_TERM_MONTHS[1]);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const houseModel = houseModels.find((m) => m.id === houseModelId);
  const roofUpgrade = roofUpgrades.find((r) => r.id === roofUpgradeId);
  const selectedAccessories = accessories.filter((a) => accessoryIds.includes(a.id));

  const quote: QuoteResult | null = useMemo(() => {
    if (!houseModel || !roofUpgrade) return null;
    return computeQuote({
      houseModel,
      roofUpgrade,
      accessories: selectedAccessories,
      exchangeRate: settings.exchangeRateBobPerUsd,
    });
  }, [houseModel, roofUpgrade, selectedAccessories, settings.exchangeRateBobPerUsd]);

  const financing = useMemo(() => {
    if (!quote || paymentMethod !== "FINANCIADO") return null;
    const downPaymentUsd = (quote.totalUsd * downPaymentPercent) / 100;
    const financedAmountUsd = quote.totalUsd - downPaymentUsd;
    const amortization = computeFrenchAmortization(financedAmountUsd, settings.annualInterestRatePercent, termMonths);
    return { downPaymentUsd, financedAmountUsd, ...amortization };
  }, [quote, paymentMethod, downPaymentPercent, termMonths, settings.annualInterestRatePercent]);

  function toggleAccessory(id: string) {
    setAccessoryIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  function scrollToForm() {
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetAll() {
    setHouseModelId(houseModels[0]?.id ?? "");
    setRoofUpgradeId(roofUpgrades[0]?.id ?? "");
    setAccessoryIds([]);
    setPaymentMethod("CONTADO");
    setDownPaymentPercent(settings.defaultDownPaymentPercent);
    setTermMonths(AVAILABLE_TERM_MONTHS[1]);
    setContact(EMPTY_CONTACT);
    setSuccess(false);
    setFormError(null);
    document.getElementById("configurador")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quote) return;
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          phone: contact.phone,
          email: contact.email || undefined,
          notes: contact.notes || undefined,
          houseModelId,
          roofUpgradeId,
          accessoryIds,
          paymentMethod,
          downPaymentPercent: paymentMethod === "FINANCIADO" ? downPaymentPercent : undefined,
          termMonths: paymentMethod === "FINANCIADO" ? termMonths : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error ?? "No se pudo enviar tu cotización");
        setSubmitting(false);
        return;
      }

      const { generateQuotePdf } = await import("@/lib/quote-pdf");
      generateQuotePdf(data, contact);

      setSuccess(true);
      setSubmitting(false);
    } catch {
      setFormError("Ocurrió un error inesperado. Intentá de nuevo.");
      setSubmitting(false);
    }
  }

  if (!houseModel || !roofUpgrade || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
        Todavía no hay modelos de casa configurados. Cargalos desde el panel de administración (/admin).
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">ECOGRUPO</span>
          <a href="#formulario" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Pedí tu cotización
          </a>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50 to-white px-4 py-16 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cotizá tu casa en minutos</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Elegí el modelo, sumá los accesorios que quieras y armá tu plan de pagos, en dólares y en bolivianos.
          </p>
          <Button className="mt-8" onClick={() => document.getElementById("configurador")?.scrollIntoView({ behavior: "smooth" })}>
            Empezar a cotizar
          </Button>
        </div>
      </section>

      <main id="configurador" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section>
              <h2 className="text-xl font-semibold">1. Elegí el modelo de tu casa</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Los precios son estimados por metro cuadrado; el total final se ajusta según terreno y planos definitivos.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {houseModels.map((model) => {
                  const selected = model.id === houseModelId;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setHouseModelId(model.id)}
                      className={clsx(
                        "flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                        selected
                          ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                          : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900",
                      )}
                    >
                      {model.hasImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/images/house-models/${model.id}`} alt={model.name} className="h-32 w-full object-cover" />
                      )}
                      <div className="flex flex-col p-4">
                        <span className="font-semibold">{model.name}</span>
                        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{model.tagline}</span>
                        <span className="mt-3 text-xs text-slate-600 dark:text-slate-300">{model.bedrooms}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300">{model.bathrooms}</span>
                        <span className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {model.areaM2} m² · {formatUsd(model.pricePerM2Usd)}/m²
                        </span>
                        <span className="mt-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          Desde {formatUsd(model.areaM2 * model.pricePerM2Usd)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Elegí el techo</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {roofUpgrades.map((roof) => {
                  const selected = roof.id === roofUpgradeId;
                  return (
                    <button
                      key={roof.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRoofUpgradeId(roof.id)}
                      className={clsx(
                        "flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                        selected
                          ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                          : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900",
                      )}
                    >
                      {roof.hasImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/images/roof-upgrades/${roof.id}`} alt={roof.name} className="h-24 w-full object-cover" />
                      )}
                      <div className="flex flex-col p-4">
                        <span className="font-semibold">{roof.name}</span>
                        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{roof.description}</span>
                        <span className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {roof.priceUsd === 0 ? "Incluido" : `+ ${formatUsd(roof.priceUsd)}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Sumá accesorios extra</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {accessories.map((accessory) => {
                  const selected = accessoryIds.includes(accessory.id);
                  return (
                    <button
                      key={accessory.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAccessory(accessory.id)}
                      className={clsx(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                        selected
                          ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                          : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900",
                      )}
                    >
                      {accessory.hasImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/images/accessories/${accessory.id}`}
                          alt={accessory.name}
                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <span className="flex-1">
                        <span className="block font-semibold">{accessory.name}</span>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{accessory.description}</span>
                        <span className="mt-2 block text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          + {formatUsd(accessory.priceUsd)}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                          selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 dark:border-slate-700",
                        )}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Elegí la forma de pago</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={paymentMethod === "CONTADO"}
                  onClick={() => setPaymentMethod("CONTADO")}
                  className={clsx(
                    "rounded-xl border p-4 text-left transition-colors",
                    paymentMethod === "CONTADO"
                      ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900",
                  )}
                >
                  <span className="font-semibold">Contado</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                    Pagás el total de una sola vez.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={paymentMethod === "FINANCIADO"}
                  onClick={() => setPaymentMethod("FINANCIADO")}
                  className={clsx(
                    "rounded-xl border p-4 text-left transition-colors",
                    paymentMethod === "FINANCIADO"
                      ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900",
                  )}
                >
                  <span className="font-semibold">Financiado</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                    Cuota inicial + cuotas mensuales, sistema francés (como un banco).
                  </span>
                </button>
              </div>

              {paymentMethod === "FINANCIADO" && financing && (
                <Card className="mt-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <Label htmlFor="downPayment" className="mb-0">
                        Cuota inicial: {downPaymentPercent}% ({formatUsd(financing.downPaymentUsd)})
                      </Label>
                    </div>
                    <input
                      id="downPayment"
                      type="range"
                      min={settings.minDownPaymentPercent}
                      max={settings.maxDownPaymentPercent}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="mt-2 w-full accent-indigo-600"
                    />
                    <div className="mt-1 flex justify-between text-xs text-slate-400">
                      <span>{settings.minDownPaymentPercent}%</span>
                      <span>{settings.maxDownPaymentPercent}%</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Plazo</span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TERM_MONTHS.map((months) => (
                        <button
                          key={months}
                          type="button"
                          aria-pressed={termMonths === months}
                          onClick={() => setTermMonths(months)}
                          className={clsx(
                            "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                            termMonths === months
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300",
                          )}
                        >
                          {months} meses
                        </button>
                      ))}
                    </div>
                  </div>

                  <dl className="mt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Monto a financiar</dt>
                      <dd>{formatUsd(financing.financedAmountUsd)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Tasa de interés anual</dt>
                      <dd>{settings.annualInterestRatePercent}%</dd>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-indigo-600 dark:text-indigo-400">
                      <dt>Cuota mensual</dt>
                      <dd>{formatUsd2dp(financing.monthlyPayment)}</dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => setShowFullSchedule((v) => !v)}
                    className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {showFullSchedule ? "Ocultar" : "Ver"} plan de pagos completo
                  </button>

                  {showFullSchedule && (
                    <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                          <tr>
                            <th className="px-3 py-2">Mes</th>
                            <th className="px-3 py-2">Cuota</th>
                            <th className="px-3 py-2">Interés</th>
                            <th className="px-3 py-2">Capital</th>
                            <th className="px-3 py-2">Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financing.schedule.map((row) => (
                            <tr key={row.month} className="border-t border-slate-100 dark:border-slate-800">
                              <td className="px-3 py-1.5">{row.month}</td>
                              <td className="px-3 py-1.5">{formatUsd2dp(row.payment)}</td>
                              <td className="px-3 py-1.5">{formatUsd2dp(row.interest)}</td>
                              <td className="px-3 py-1.5">{formatUsd2dp(row.principal)}</td>
                              <td className="px-3 py-1.5">{formatUsd2dp(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <QuoteSummary quote={quote} financing={financing} onRequestQuote={scrollToForm} />
          </div>
        </div>

        <section id="formulario" className="mx-auto mt-16 max-w-xl scroll-mt-6">
          <Card>
            {success ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓
                </div>
                <h2 className="mt-4 text-xl font-semibold">¡Listo, {contact.name}!</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Descargamos tu cotización en PDF y guardamos tus datos. Nuestro equipo te va a contactar al{" "}
                  {contact.phone} para coordinar los siguientes pasos.
                </p>
                <Button variant="secondary" className="mt-6" onClick={resetAll}>
                  Armar otra cotización
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">5. Dejá tus datos y descargá tu cotización</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Te vamos a contactar para coordinar la visita al terreno y afinar los detalles.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" required value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                    <Input id="phone" required value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Comentarios (opcional)</Label>
                    <Textarea id="notes" rows={3} value={contact.notes} onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))} />
                  </div>
                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Generando cotización..." : "Generar mi cotización en PDF"}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}

function QuoteSummary({
  quote,
  financing,
  onRequestQuote,
}: {
  quote: QuoteResult;
  financing: ({ downPaymentUsd: number; financedAmountUsd: number; monthlyPayment: number }) | null;
  onRequestQuote: () => void;
}) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">Tu cotización</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">
            {quote.houseModel.name} ({quote.houseModel.areaM2} m²)
          </dt>
          <dd className="font-medium">{formatUsd(quote.baseUsd)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{quote.roofUpgrade.name}</dt>
          <dd className="font-medium">{quote.roofUpgrade.priceUsd === 0 ? "Incluido" : formatUsd(quote.roofUpgrade.priceUsd)}</dd>
        </div>
        {quote.accessories.map((accessory) => (
          <div key={accessory.id} className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">{accessory.name}</dt>
            <dd className="font-medium">{formatUsd(accessory.priceUsd)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total estimado</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatUsd(quote.totalUsd)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">Tipo de cambio: 1 USD = {quote.exchangeRate} Bs</span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatBob(quote.totalBob)}</span>
        </div>
        {financing && (
          <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm dark:bg-indigo-950/40">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Cuota inicial</span>
              <span className="font-medium">{formatUsd(financing.downPaymentUsd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Cuota mensual</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatUsd2dp(financing.monthlyPayment)}</span>
            </div>
          </div>
        )}
      </div>
      <Button className="mt-6 w-full" onClick={onRequestQuote}>
        Solicitar cotización y PDF
      </Button>
    </Card>
  );
}
