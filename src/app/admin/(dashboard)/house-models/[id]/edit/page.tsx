import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HouseModelForm } from "@/components/admin/house-model-form";

export default async function EditHouseModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await prisma.houseModel.findUnique({ where: { id } });
  if (!model) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold">Editar modelo de casa</h1>
      <div className="mt-6">
        <HouseModelForm
          initial={{
            id: model.id,
            name: model.name,
            tagline: model.tagline,
            bedrooms: model.bedrooms,
            bathrooms: model.bathrooms,
            areaM2: Number(model.areaM2),
            pricePerM2Usd: Number(model.pricePerM2Usd),
            order: model.order,
            active: model.active,
            hasImage: Boolean(model.imageData),
          }}
        />
      </div>
    </div>
  );
}
