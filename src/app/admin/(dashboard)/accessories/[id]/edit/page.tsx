import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PricedItemForm } from "@/components/admin/priced-item-form";

export default async function EditAccessoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const accessory = await prisma.accessory.findUnique({ where: { id } });
  if (!accessory) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold">Editar accesorio</h1>
      <div className="mt-6">
        <PricedItemForm
          apiBase="/api/admin/accessories"
          imageBase="/api/images/accessories"
          listPath="/admin/accessories"
          initial={{
            id: accessory.id,
            name: accessory.name,
            description: accessory.description,
            priceUsd: Number(accessory.priceUsd),
            order: accessory.order,
            active: accessory.active,
            hasImage: Boolean(accessory.imageData),
          }}
        />
      </div>
    </div>
  );
}
