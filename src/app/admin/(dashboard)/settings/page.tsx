import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  exchangeRateBobPerUsd: 12.5,
  annualInterestRatePercent: 8,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 50,
  defaultDownPaymentPercent: 20,
};

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  const initial = settings
    ? {
        exchangeRateBobPerUsd: Number(settings.exchangeRateBobPerUsd),
        annualInterestRatePercent: Number(settings.annualInterestRatePercent),
        minDownPaymentPercent: settings.minDownPaymentPercent,
        maxDownPaymentPercent: settings.maxDownPaymentPercent,
        defaultDownPaymentPercent: settings.defaultDownPaymentPercent,
      }
    : DEFAULTS;

  return (
    <div>
      <h1 className="text-xl font-semibold">Configuración</h1>
      <div className="mt-6">
        <SettingsForm initial={initial} />
      </div>
    </div>
  );
}
