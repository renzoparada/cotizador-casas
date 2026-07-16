const usdFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const bobFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdFormatter2dp = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}

export function formatUsd2dp(amount: number): string {
  return usdFormatter2dp.format(amount);
}

export function formatBob(amount: number): string {
  return bobFormatter.format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
}
