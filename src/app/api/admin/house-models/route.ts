import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, ApiError } from "@/lib/api-helpers";
import { houseModelSchema } from "@/lib/validation";
import { extractImage, formDataToObject } from "@/lib/admin-form";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const form = await request.formData();
    const parsed = houseModelSchema.safeParse(formDataToObject(form));
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
    }
    const image = await extractImage(form);

    const houseModel = await prisma.houseModel.create({
      data: {
        ...parsed.data,
        imageData: image?.data,
        imageMimeType: image?.mimeType,
      },
    });

    return NextResponse.json(houseModel, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
