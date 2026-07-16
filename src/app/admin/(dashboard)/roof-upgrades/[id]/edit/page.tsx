import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PricedItemForm } from "@/components/admin/priced-item-form";

export default async function EditRoofUpgradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roofUpgrade = await prisma.roofUpgrade.findUnique({ where: { id } });
  if (!roofUpgrade) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold">Editar techo</h1>
      <div className="mt-6">
        <PricedItemForm
          apiBase="/api/admin/roof-upgrades"
          imageBase="/api/images/roof-upgrades"
          listPath="/admin/roof-upgrades"
          initial={{
            id: roofUpgrade.id,
            name: roofUpgrade.name,
            description: roofUpgrade.description,
            priceUsd: Number(roofUpgrade.priceUsd),
            order: roofUpgrade.order,
            active: roofUpgrade.active,
            hasImage: Boolean(roofUpgrade.imageData),
          }}
        />
      </div>
    </div>
  );
}
