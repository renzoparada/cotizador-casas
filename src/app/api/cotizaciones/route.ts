import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { handleApiError, ApiError } from "@/lib/api-helpers";
import { quoteLeadSchema } from "@/lib/validation";
import { computeQuote } from "@/lib/quote";
import { computeFrenchAmortization } from "@/lib/amortization";
import type { FinancingPlan } from "@/lib/quote-pdf";

const SETTINGS_DEFAULTS = {
  exchangeRateBobPerUsd: 12.5,
  annualInterestRatePercent: 8,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 50,
  defaultDownPaymentPercent: 20,
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = quoteLeadSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
    }
    const data = parsed.data;

    const [houseModel, roofUpgrade, accessories, settingsRow] = await Promise.all([
      prisma.houseModel.findFirst({ where: { id: data.houseModelId, active: true } }),
      prisma.roofUpgrade.findFirst({ where: { id: data.roofUpgradeId, active: true } }),
      prisma.accessory.findMany({ where: { id: { in: data.accessoryIds ?? [] }, active: true } }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    ]);

    if (!houseModel) throw new ApiError("Modelo de casa inválido", 400);
    if (!roofUpgrade) throw new ApiError("Tipo de techo inválido", 400);

    const settings = settingsRow
      ? {
          exchangeRateBobPerUsd: Number(settingsRow.exchangeRateBobPerUsd),
          annualInterestRatePercent: Number(settingsRow.annualInterestRatePercent),
          minDownPaymentPercent: settingsRow.minDownPaymentPercent,
          maxDownPaymentPercent: settingsRow.maxDownPaymentPercent,
        }
      : SETTINGS_DEFAULTS;

    const quote = computeQuote({
      houseModel: {
        id: houseModel.id,
        name: houseModel.name,
        bedrooms: houseModel.bedrooms,
        bathrooms: houseModel.bathrooms,
        areaM2: Number(houseModel.areaM2),
        pricePerM2Usd: Number(houseModel.pricePerM2Usd),
      },
      roofUpgrade: { id: roofUpgrade.id, name: roofUpgrade.name, priceUsd: Number(roofUpgrade.priceUsd) },
      accessories: accessories.map((a) => ({ id: a.id, name: a.name, priceUsd: Number(a.priceUsd) })),
      exchangeRate: settings.exchangeRateBobPerUsd,
    });

    let financing: FinancingPlan | null = null;
    if (data.paymentMethod === "FINANCIADO") {
      if (!data.downPaymentPercent || !data.termMonths) {
        throw new ApiError("Faltan los datos de financiamiento", 400);
      }
      const downPaymentPercent = Math.min(
        Math.max(data.downPaymentPercent, settings.minDownPaymentPercent),
        settings.maxDownPaymentPercent,
      );
      const downPaymentUsd = (quote.totalUsd * downPaymentPercent) / 100;
      const financedAmountUsd = quote.totalUsd - downPaymentUsd;
      const amortization = computeFrenchAmortization(financedAmountUsd, settings.annualInterestRatePercent, data.termMonths);

      financing = {
        downPaymentPercent,
        downPaymentUsd,
        financedAmountUsd,
        termMonths: data.termMonths,
        annualInterestRate: settings.annualInterestRatePercent,
        monthlyPayment: amortization.monthlyPayment,
        schedule: amortization.schedule,
      };
    }

    const lead = await prisma.constructionQuoteLead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        notes: data.notes || null,
        houseModelId: quote.houseModel.id,
        houseModelName: quote.houseModel.name,
        areaM2: quote.houseModel.areaM2,
        pricePerM2Usd: quote.houseModel.pricePerM2Usd,
        roofUpgradeId: quote.roofUpgrade.id,
        roofUpgradeName: quote.roofUpgrade.name,
        accessories: quote.accessories.map((a) => ({ id: a.id, name: a.name, priceUsd: a.priceUsd })),
        baseUsd: quote.baseUsd,
        accessoriesUsd: quote.accessoriesUsd,
        totalUsd: quote.totalUsd,
        exchangeRate: quote.exchangeRate,
        totalBob: quote.totalBob,
        paymentMethod: data.paymentMethod,
        downPaymentPercent: financing?.downPaymentPercent,
        downPaymentUsd: financing?.downPaymentUsd,
        financedAmountUsd: financing?.financedAmountUsd,
        termMonths: financing?.termMonths,
        annualInterestRate: financing?.annualInterestRate,
        monthlyPaymentUsd: financing?.monthlyPayment,
        amortizationSchedule: financing ? (financing.schedule as unknown as Prisma.InputJsonValue) : undefined,
      },
    });

    return NextResponse.json({ id: lead.id, quote, financing }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
