// Sistema de amortización francés: cuota mensual fija, con interés
// decreciente y amortización de capital creciente, igual que un préstamo
// bancario tradicional.

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface AmortizationResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  schedule: AmortizationRow[];
}

/**
 * @param principal monto financiado (ya descontada la cuota inicial)
 * @param annualRatePercent tasa de interés nominal anual, ej. 8 para 8%
 * @param termMonths plazo del crédito en meses
 */
export function computeFrenchAmortization(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): AmortizationResult {
  const monthlyRate = annualRatePercent / 100 / 12;

  const monthlyPayment =
    monthlyRate === 0 ? principal / termMonths : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    let principalPayment = monthlyPayment - interest;
    let payment = monthlyPayment;

    // En la última cuota se ajusta para que el saldo cierre exactamente en 0
    // y no queden centavos colgando por redondeo acumulado.
    if (month === termMonths) {
      principalPayment = balance;
      payment = principalPayment + interest;
    }

    balance = Math.max(balance - principalPayment, 0);
    schedule.push({ month, payment, interest, principal: principalPayment, balance });
  }

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = totalPaid - principal;

  return { monthlyPayment, totalPaid, totalInterest, schedule };
}

export const AVAILABLE_TERM_MONTHS = [12, 24, 36, 48, 60] as const;
