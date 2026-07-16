import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, ApiError } from "@/lib/api-helpers";
import { siteSettingsSchema } from "@/lib/validation";

export async function PUT(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = siteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
    }

    if (parsed.data.minDownPaymentPercent > parsed.data.maxDownPaymentPercent) {
      throw new ApiError("El mínimo de cuota inicial no puede ser mayor al máximo", 400);
    }
    if (
      parsed.data.defaultDownPaymentPercent < parsed.data.minDownPaymentPercent ||
      parsed.data.defaultDownPaymentPercent > parsed.data.maxDownPaymentPercent
    ) {
      throw new ApiError("La cuota inicial por defecto debe estar entre el mínimo y el máximo", 400);
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}
