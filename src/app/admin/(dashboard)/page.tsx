import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [houseModels, roofUpgrades, accessories, leads] = await Promise.all([
    prisma.houseModel.count(),
    prisma.roofUpgrade.count(),
    prisma.accessory.count(),
    prisma.constructionQuoteLead.count(),
  ]);

  const cards = [
    { href: "/admin/house-models", label: "Modelos de casa", count: houseModels },
    { href: "/admin/roof-upgrades", label: "Techos", count: roofUpgrades },
    { href: "/admin/accessories", label: "Accesorios", count: accessories },
    { href: "/admin/leads", label: "Cotizaciones recibidas", count: leads },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold">Panel del cotizador</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Desde acá editás lo que ve el cliente en el sitio público: modelos, techos, accesorios, precios,
        tipo de cambio y tasa de interés.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-colors hover:border-indigo-400">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{card.count}</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{card.label}</span>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/admin/settings" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Ir a configuración (tipo de cambio y tasa de interés) →
        </Link>
      </div>
    </div>
  );
}
