import { prisma } from "@/lib/prisma";
import { PricedItemList } from "@/components/admin/priced-item-list";

export const dynamic = "force-dynamic";

export default async function RoofUpgradesPage() {
  const roofUpgrades = await prisma.roofUpgrade.findMany({ orderBy: { order: "asc" } });

  return (
    <PricedItemList
      title="Techos"
      items={roofUpgrades.map((r) => ({
        id: r.id,
        name: r.name,
        priceUsd: Number(r.priceUsd),
        order: r.order,
        active: r.active,
        hasImage: Boolean(r.imageData),
      }))}
      editBasePath="/admin/roof-upgrades"
      newPath="/admin/roof-upgrades/new"
      apiBase="/api/admin/roof-upgrades"
      imageBase="/api/images/roof-upgrades"
    />
  );
}
