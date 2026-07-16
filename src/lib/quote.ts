export interface QuoteHouseModelInput {
  id: string;
  name: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: number;
  pricePerM2Usd: number;
}

export interface QuotePricedItem {
  id: string;
  name: string;
  priceUsd: number;
}

export interface QuoteInput {
  houseModel: QuoteHouseModelInput;
  roofUpgrade: QuotePricedItem;
  accessories: QuotePricedItem[];
  exchangeRate: number;
}

export interface QuoteResult {
  houseModel: QuoteHouseModelInput;
  roofUpgrade: QuotePricedItem;
  accessories: QuotePricedItem[];
  baseUsd: number;
  accessoriesUsd: number;
  totalUsd: number;
  exchangeRate: number;
  totalBob: number;
}

/** Calcula el precio total a partir de los registros ya resueltos desde la base de datos. */
export function computeQuote(input: QuoteInput): QuoteResult {
  const baseUsd = input.houseModel.areaM2 * input.houseModel.pricePerM2Usd;
  const accessoriesUsd = input.roofUpgrade.priceUsd + input.accessories.reduce((sum, a) => sum + a.priceUsd, 0);
  const totalUsd = baseUsd + accessoriesUsd;
  const totalBob = totalUsd * input.exchangeRate;

  return {
    houseModel: input.houseModel,
    roofUpgrade: input.roofUpgrade,
    accessories: input.accessories,
    baseUsd,
    accessoriesUsd,
    totalUsd,
    exchangeRate: input.exchangeRate,
    totalBob,
  };
}
