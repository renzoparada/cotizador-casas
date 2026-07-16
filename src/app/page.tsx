import { prisma } from "@/lib/prisma";
import { QuoteBuilder } from "@/components/quote-builder";

// Los modelos, accesorios y ajustes se editan desde /admin sin rebuild, así
// que esta página no puede quedar prerenderizada estática: debe leer la
// base de datos en cada request.
export const dynamic = "force-dynamic";

const SETTINGS_DEFAULTS = {
  exchangeRateBobPerUsd: 12.5,
  annualInterestRatePercent: 8,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 50,
  defaultDownPaymentPercent: 20,
};

export default async function HomePage() {
  const [houseModels, roofUpgrades, accessories, settingsRow] = await Promise.all([
    prisma.houseModel.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.roofUpgrade.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.accessory.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const settings = settingsRow
    ? {
        exchangeRateBobPerUsd: Number(settingsRow.exchangeRateBobPerUsd),
        annualInterestRatePercent: Number(settingsRow.annualInterestRatePercent),
        minDownPaymentPercent: settingsRow.minDownPaymentPercent,
        maxDownPaymentPercent: settingsRow.maxDownPaymentPercent,
        defaultDownPaymentPercent: settingsRow.defaultDownPaymentPercent,
      }
    : SETTINGS_DEFAULTS;

  return (
    <QuoteBuilder
      houseModels={houseModels.map((m) => ({
        id: m.id,
        name: m.name,
        tagline: m.tagline,
        bedrooms: m.bedrooms,
        bathrooms: m.bathrooms,
        areaM2: Number(m.areaM2),
        pricePerM2Usd: Number(m.pricePerM2Usd),
        hasImage: Boolean(m.imageData),
      }))}
      roofUpgrades={roofUpgrades.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        priceUsd: Number(r.priceUsd),
        hasImage: Boolean(r.imageData),
      }))}
      accessories={accessories.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        priceUsd: Number(a.priceUsd),
        hasImage: Boolean(a.imageData),
      }))}
      settings={settings}
    />
  );
}
