import { z } from "zod";

// FormData siempre manda strings; z.coerce.boolean() trataría "false" como
// truthy (string no vacío), así que este helper interpreta "true"/"false" a mano.
const booleanFromString = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional()
  .default(true);

export const quoteLeadSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  phone: z.string().trim().min(6, "Ingresá un teléfono válido").max(30),
  email: z.string().trim().toLowerCase().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().nullable(),
  houseModelId: z.string().trim().min(1, "Elegí un modelo de casa"),
  roofUpgradeId: z.string().trim().min(1, "Elegí un tipo de techo"),
  accessoryIds: z.array(z.string().trim()).max(50).optional(),
  paymentMethod: z.enum(["CONTADO", "FINANCIADO"]),
  downPaymentPercent: z.coerce.number().int().min(0).max(100).optional(),
  termMonths: z.coerce.number().int().min(1).max(360).optional(),
});

export const houseModelSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  tagline: z.string().trim().max(200).optional().default(""),
  bedrooms: z.string().trim().max(120).optional().default(""),
  bathrooms: z.string().trim().max(120).optional().default(""),
  areaM2: z.coerce.number().positive("El área debe ser mayor a 0"),
  pricePerM2Usd: z.coerce.number().positive("El precio debe ser mayor a 0"),
  order: z.coerce.number().int().optional().default(0),
  active: booleanFromString,
});

export const roofUpgradeSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  description: z.string().trim().max(300).optional().default(""),
  priceUsd: z.coerce.number().min(0, "El precio no puede ser negativo"),
  order: z.coerce.number().int().optional().default(0),
  active: booleanFromString,
});

export const accessorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  description: z.string().trim().max(300).optional().default(""),
  priceUsd: z.coerce.number().min(0, "El precio no puede ser negativo"),
  order: z.coerce.number().int().optional().default(0),
  active: booleanFromString,
});

export const siteSettingsSchema = z.object({
  exchangeRateBobPerUsd: z.coerce.number().positive("El tipo de cambio debe ser mayor a 0"),
  annualInterestRatePercent: z.coerce.number().min(0).max(100),
  minDownPaymentPercent: z.coerce.number().int().min(0).max(100),
  maxDownPaymentPercent: z.coerce.number().int().min(0).max(100),
  defaultDownPaymentPercent: z.coerce.number().int().min(0).max(100),
});
