import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Badge } from "@/components/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HouseModelsPage() {
  const models = await prisma.houseModel.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Modelos de casa</h1>
        <Link href="/admin/house-models/new">
          <Button>+ Nuevo modelo</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {models.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay modelos cargados.</p>}
        {models.map((model) => (
          <div
            key={model.id}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {model.imageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/images/house-models/${model.id}`} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{model.name}</span>
                  <Badge variant={model.active ? "success" : "default"}>{model.active ? "Activo" : "Inactivo"}</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {Number(model.areaM2)} m² · {formatUsd(Number(model.pricePerM2Usd))}/m² · orden {model.order}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/house-models/${model.id}/edit`}>
                <Button variant="secondary">Editar</Button>
              </Link>
              <DeleteButton apiPath={`/api/admin/house-models/${model.id}`} confirmMessage={`¿Eliminar "${model.name}"?`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
