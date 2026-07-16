import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBob, formatUsd, formatUsd2dp } from "@/lib/format";
import type { QuoteResult } from "@/lib/quote";
import type { AmortizationRow } from "@/lib/amortization";

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface FinancingPlan {
  downPaymentPercent: number;
  downPaymentUsd: number;
  financedAmountUsd: number;
  termMonths: number;
  annualInterestRate: number;
  monthlyPayment: number;
  schedule: AmortizationRow[];
}

export interface QuoteApiResponse {
  id: string;
  quote: QuoteResult;
  financing: FinancingPlan | null;
}

export function generateQuotePdf({ id, quote, financing }: QuoteApiResponse, contact: ContactInfo) {
  const doc = new jsPDF();
  const marginX = 14;
  let y = 20;

  doc.setFontSize(18);
  doc.text("Cotización de construcción", marginX, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`N° de cotización: ${id.slice(0, 8).toUpperCase()}`, marginX, y);
  y += 6;
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, marginX, y);
  y += 10;
  doc.setTextColor(0);

  doc.setFontSize(12);
  doc.text("Datos del cliente", marginX, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`Nombre: ${contact.name}`, marginX, y);
  y += 6;
  doc.text(`Teléfono: ${contact.phone}`, marginX, y);
  y += 6;
  if (contact.email) {
    doc.text(`Email: ${contact.email}`, marginX, y);
    y += 6;
  }
  y += 4;

  doc.setFontSize(12);
  doc.text("Modelo elegido", marginX, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`${quote.houseModel.name} — ${quote.houseModel.areaM2} m²`, marginX, y);
  y += 6;
  doc.text(quote.houseModel.bedrooms, marginX, y);
  y += 6;
  doc.text(quote.houseModel.bathrooms, marginX, y);
  y += 6;
  doc.text(`Precio por m²: ${formatUsd(quote.houseModel.pricePerM2Usd)}`, marginX, y);
  y += 6;
  doc.text(`Subtotal construcción: ${formatUsd(quote.baseUsd)}`, marginX, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Extras seleccionados", marginX, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(
    `Techo: ${quote.roofUpgrade.name} — ${quote.roofUpgrade.priceUsd === 0 ? "incluido" : formatUsd(quote.roofUpgrade.priceUsd)}`,
    marginX,
    y,
  );
  y += 6;

  if (quote.accessories.length === 0) {
    doc.text("Sin accesorios adicionales", marginX, y);
    y += 6;
  } else {
    for (const accessory of quote.accessories) {
      doc.text(`${accessory.name} — ${formatUsd(accessory.priceUsd)}`, marginX, y);
      y += 6;
    }
  }
  y += 6;

  doc.setFontSize(12);
  doc.text("Total estimado", marginX, y);
  y += 8;
  doc.setFontSize(14);
  doc.text(`${formatUsd(quote.totalUsd)}  /  ${formatBob(quote.totalBob)}`, marginX, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Tipo de cambio referencial: 1 USD = ${quote.exchangeRate} Bs`, marginX, y);
  y += 10;
  doc.setTextColor(0);

  if (!financing) {
    doc.setFontSize(12);
    doc.text("Forma de pago: Contado", marginX, y);
    y += 8;
  } else {
    doc.setFontSize(12);
    doc.text("Forma de pago: Financiado (sistema francés)", marginX, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Cuota inicial (${financing.downPaymentPercent}%): ${formatUsd(financing.downPaymentUsd)}`, marginX, y);
    y += 6;
    doc.text(`Monto financiado: ${formatUsd(financing.financedAmountUsd)}`, marginX, y);
    y += 6;
    doc.text(`Plazo: ${financing.termMonths} meses — Tasa anual: ${financing.annualInterestRate}%`, marginX, y);
    y += 6;
    doc.setFontSize(12);
    doc.text(`Cuota mensual: ${formatUsd2dp(financing.monthlyPayment)}`, marginX, y);
    y += 10;

    doc.setFontSize(11);
    doc.text("Plan de pagos", marginX, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Cuota", "Interés", "Capital", "Saldo"]],
      body: financing.schedule.map((row) => [
        String(row.month),
        formatUsd2dp(row.payment),
        formatUsd2dp(row.interest),
        formatUsd2dp(row.principal),
        formatUsd2dp(row.balance),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: marginX, right: marginX },
    });
  }

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    "Cotización referencial válida por 15 días. El precio final está sujeto a verificación de terreno y condiciones del sitio.",
    marginX,
    finalY + 10,
    { maxWidth: 180 },
  );

  doc.save(`cotizacion-${id.slice(0, 8)}.pdf`);
}
