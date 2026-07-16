import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImageRecord = { imageData: Uint8Array | null; imageMimeType: string | null } | null;

function findImage(entity: string, id: string): Promise<ImageRecord> {
  const select = { imageData: true, imageMimeType: true } as const;
  switch (entity) {
    case "house-models":
      return prisma.houseModel.findUnique({ where: { id }, select });
    case "roof-upgrades":
      return prisma.roofUpgrade.findUnique({ where: { id }, select });
    case "accessories":
      return prisma.accessory.findUnique({ where: { id }, select });
    default:
      return Promise.resolve(null);
  }
}

/** Sirve la foto (guardada como bytes en la base de datos) de un modelo/techo/accesorio. Público. */
export async function GET(_request: Request, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  const record = await findImage(entity, id);

  if (!record?.imageData || !record.imageMimeType) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(record.imageData), {
    headers: {
      "Content-Type": record.imageMimeType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
