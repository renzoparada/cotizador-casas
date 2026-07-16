import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import { formatUsd, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.constructionQuoteLead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <h1 className="text-xl font-semibold">Cotizaciones recibidas</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Últimas {leads.length} cotizaciones enviadas desde el sitio.</p>

      <div className="mt-6 space-y-3">
        {leads.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no llegó ninguna cotización.</p>}
        {leads.map((lead) => (
          <Link key={lead.id} href={`/admin/leads/${lead.id}`}>
            <Card className="transition-colors hover:border-indigo-400">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold">{lead.name}</span>
                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{lead.phone}</span>
                </div>
                <Badge variant={lead.paymentMethod === "FINANCIADO" ? "warning" : "success"}>
                  {lead.paymentMethod === "FINANCIADO" ? "Financiado" : "Contado"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {lead.houseModelName} — {formatUsd(Number(lead.totalUsd))}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDate(lead.createdAt)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
