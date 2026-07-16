import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatUsd } from "@/lib/format";

export interface PricedItemListRow {
  id: string;
  name: string;
  priceUsd: number;
  order: number;
  active: boolean;
  hasImage: boolean;
}

export function PricedItemList({
  title,
  items,
  editBasePath,
  newPath,
  apiBase,
  imageBase,
}: {
  title: string;
  items: PricedItemListRow[];
  editBasePath: string;
  newPath: string;
  apiBase: string;
  imageBase: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Link href={newPath}>
          <Button>+ Nuevo</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay nada cargado.</p>}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {item.hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${imageBase}/${item.id}`} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.name}</span>
                  <Badge variant={item.active ? "success" : "default"}>{item.active ? "Activo" : "Inactivo"}</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatUsd(item.priceUsd)} · orden {item.order}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`${editBasePath}/${item.id}/edit`}>
                <Button variant="secondary">Editar</Button>
              </Link>
              <DeleteButton apiPath={`${apiBase}/${item.id}`} confirmMessage={`¿Eliminar "${item.name}"?`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
