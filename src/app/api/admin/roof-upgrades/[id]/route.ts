import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, ApiError } from "@/lib/api-helpers";
import { roofUpgradeSchema } from "@/lib/validation";
import { extractImage, formDataToObject } from "@/lib/admin-form";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const form = await request.formData();
    const parsed = roofUpgradeSchema.safeParse(formDataToObject(form));
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
    }
    const image = await extractImage(form);

    const roofUpgrade = await prisma.roofUpgrade.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(image ? { imageData: image.data, imageMimeType: image.mimeType } : {}),
      },
    });

    return NextResponse.json(roofUpgrade);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.roofUpgrade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
