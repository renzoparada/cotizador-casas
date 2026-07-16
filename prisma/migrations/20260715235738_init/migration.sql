-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CONTADO', 'FINANCIADO');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "exchangeRateBobPerUsd" DECIMAL(10,4) NOT NULL,
    "annualInterestRatePercent" DECIMAL(6,3) NOT NULL,
    "minDownPaymentPercent" INTEGER NOT NULL,
    "maxDownPaymentPercent" INTEGER NOT NULL,
    "defaultDownPaymentPercent" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "bedrooms" TEXT NOT NULL,
    "bathrooms" TEXT NOT NULL,
    "areaM2" DECIMAL(10,2) NOT NULL,
    "pricePerM2Usd" DECIMAL(12,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoofUpgrade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceUsd" DECIMAL(12,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoofUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceUsd" DECIMAL(12,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionQuoteLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "houseModelId" TEXT NOT NULL,
    "houseModelName" TEXT NOT NULL,
    "areaM2" DECIMAL(10,2) NOT NULL,
    "pricePerM2Usd" DECIMAL(12,2) NOT NULL,
    "roofUpgradeId" TEXT NOT NULL,
    "roofUpgradeName" TEXT NOT NULL,
    "accessories" JSONB NOT NULL,
    "baseUsd" DECIMAL(12,2) NOT NULL,
    "accessoriesUsd" DECIMAL(12,2) NOT NULL,
    "totalUsd" DECIMAL(12,2) NOT NULL,
    "exchangeRate" DECIMAL(10,4) NOT NULL,
    "totalBob" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "downPaymentPercent" INTEGER,
    "downPaymentUsd" DECIMAL(12,2),
    "financedAmountUsd" DECIMAL(12,2),
    "termMonths" INTEGER,
    "annualInterestRate" DECIMAL(6,3),
    "monthlyPaymentUsd" DECIMAL(12,2),
    "amortizationSchedule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstructionQuoteLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "ConstructionQuoteLead_createdAt_idx" ON "ConstructionQuoteLead"("createdAt");
