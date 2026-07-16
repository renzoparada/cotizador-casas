import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se crea usuario admin.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: { email: email.toLowerCase(), passwordHash },
  });
  console.log(`Usuario admin listo: ${email}`);
}

async function seedSettings() {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      exchangeRateBobPerUsd: 12.5,
      annualInterestRatePercent: 8,
      minDownPaymentPercent: 10,
      maxDownPaymentPercent: 50,
      defaultDownPaymentPercent: 20,
    },
  });
  console.log("Configuración de sitio lista.");
}

async function seedCatalog() {
  const houseModelCount = await prisma.houseModel.count();
  if (houseModelCount === 0) {
    await prisma.houseModel.createMany({
      data: [
        {
          name: "Casa Mono Ambiente",
          tagline: "Compacta y funcional, ideal para una persona o pareja.",
          bedrooms: "1 ambiente integrado",
          bathrooms: "1 baño",
          areaM2: 35,
          pricePerM2Usd: 420,
          order: 1,
        },
        {
          name: "Casa de 2 Habitaciones",
          tagline: "Una suite principal y una habitación con baño de visita.",
          bedrooms: "2 habitaciones (1 en suite)",
          bathrooms: "1 baño en suite + 1 baño de visita",
          areaM2: 62,
          pricePerM2Usd: 390,
          order: 2,
        },
        {
          name: "Casa de 3 Habitaciones",
          tagline: "Suite principal, dos habitaciones adicionales y baño compartido.",
          bedrooms: "3 habitaciones (1 suite + 2 adicionales)",
          bathrooms: "1 baño en suite + 1 baño compartido",
          areaM2: 88,
          pricePerM2Usd: 365,
          order: 3,
        },
      ],
    });
    console.log("Modelos de casa de ejemplo creados.");
  }

  const roofCount = await prisma.roofUpgrade.count();
  if (roofCount === 0) {
    await prisma.roofUpgrade.createMany({
      data: [
        { name: "Techo estándar", description: "Incluido en el precio base del modelo.", priceUsd: 0, order: 1 },
        {
          name: "Techo de teja colonial",
          description: "Acabado tradicional, gran durabilidad y aislamiento térmico.",
          priceUsd: 1400,
          order: 2,
        },
        { name: "Techo de calamina Duralit", description: "Liviano, resistente e impermeable.", priceUsd: 950, order: 3 },
      ],
    });
    console.log("Techos de ejemplo creados.");
  }

  const accessoryCount = await prisma.accessory.count();
  if (accessoryCount === 0) {
    await prisma.accessory.createMany({
      data: [
        { name: "Parrillero", description: "Espacio de parrillero techado para reuniones familiares.", priceUsd: 650, order: 1 },
        {
          name: "Sistema de enfriamiento natural",
          description: "Ventilación cruzada que mantiene fresco el interior sin aire acondicionado.",
          priceUsd: 900,
          order: 2,
        },
        {
          name: "Sistema con paneles solares",
          description: "Genera energía limpia y reduce tu factura eléctrica.",
          priceUsd: 3200,
          order: 3,
        },
        { name: "Invernadero hidropónico", description: "Cultivá tus propios alimentos sin usar tierra.", priceUsd: 1800, order: 4 },
        { name: "Piscina", description: "Piscina de hormigón con sistema de filtrado.", priceUsd: 4500, order: 5 },
        { name: "Sauna", description: "Sauna seco tipo finlandés para relajarte en casa.", priceUsd: 2600, order: 6 },
      ],
    });
    console.log("Accesorios de ejemplo creados.");
  }
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedCatalog();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
