import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { formatUsd, formatBob, formatDate } from "@/lib/format";
import type { AmortizationRow } from "@/lib/amortization";

interface AccessoryLine {
  id: string;
  name: string;
  priceUsd: number;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.constructionQuoteLead.findUnique({ where: { id } });
  if (!lead) notFound();

  const accessories = (lead.accessories as unknown as AccessoryLine[]) ?? [];
  const schedule = (lead.amortizationSchedule as unknown as AmortizationRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{lead.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(lead.createdAt)}</p>
      </div>

      <Card>
        <h2 className="font-semibold">Contacto</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Teléfono</dt><dd>{lead.phone}</dd></div>
          {lead.email && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Email</dt><dd>{lead.email}</dd></div>}
          {lead.notes && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Comentarios</dt><dd>{lead.notes}</dd></div>}
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold">Cotización</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">{lead.houseModelName} ({Number(lead.areaM2)} m²)</dt>
            <dd>{formatUsd(Number(lead.baseUsd))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">{lead.roofUpgradeName}</dt>
            <dd></dd>
          </div>
          {accessories.map((a) => (
            <div key={a.id} className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{a.name}</dt>
              <dd>{formatUsd(a.priceUsd)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold dark:border-slate-800">
            <dt>Total</dt>
            <dd>
              {formatUsd(Number(lead.totalUsd))} / {formatBob(Number(lead.totalBob))}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold">Forma de pago</h2>
        {lead.paymentMethod === "CONTADO" ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Contado — {formatUsd(Number(lead.totalUsd))}</p>
        ) : (
          <div className="mt-2 space-y-3 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Cuota inicial ({lead.downPaymentPercent}%)</dt>
                <dd>{formatUsd(Number(lead.downPaymentUsd))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Monto financiado</dt>
                <dd>{formatUsd(Number(lead.financedAmountUsd))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Plazo</dt>
                <dd>{lead.termMonths} meses</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Tasa anual</dt>
                <dd>{Number(lead.annualInterestRate)}%</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Cuota mensual</dt>
                <dd>{formatUsd(Number(lead.monthlyPaymentUsd))}</dd>
              </div>
            </dl>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
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
                  {schedule.map((row) => (
                    <tr key={row.month} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-1.5">{row.month}</td>
                      <td className="px-3 py-1.5">{formatUsd(row.payment)}</td>
                      <td className="px-3 py-1.5">{formatUsd(row.interest)}</td>
                      <td className="px-3 py-1.5">{formatUsd(row.principal)}</td>
                      <td className="px-3 py-1.5">{formatUsd(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
