import { prisma } from "@/lib/prisma";
import { PricedItemList } from "@/components/admin/priced-item-list";

export const dynamic = "force-dynamic";

export default async function AccessoriesPage() {
  const accessories = await prisma.accessory.findMany({ orderBy: { order: "asc" } });

  return (
    <PricedItemList
      title="Accesorios"
      items={accessories.map((a) => ({
        id: a.id,
        name: a.name,
        priceUsd: Number(a.priceUsd),
        order: a.order,
        active: a.active,
        hasImage: Boolean(a.imageData),
      }))}
      editBasePath="/admin/accessories"
      newPath="/admin/accessories/new"
      apiBase="/api/admin/accessories"
      imageBase="/api/images/accessories"
    />
  );
}
