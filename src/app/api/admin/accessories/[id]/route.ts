import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, ApiError } from "@/lib/api-helpers";
import { accessorySchema } from "@/lib/validation";
import { extractImage, formDataToObject } from "@/lib/admin-form";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const form = await request.formData();
    const parsed = accessorySchema.safeParse(formDataToObject(form));
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
    }
    const image = await extractImage(form);

    const accessory = await prisma.accessory.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(image ? { imageData: image.data, imageMimeType: image.mimeType } : {}),
      },
    });

    return NextResponse.json(accessory);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.accessory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
