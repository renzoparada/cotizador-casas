import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

/**
 * Endpoint de un solo uso para crear el usuario admin y el catálogo de
 * ejemplo en un deploy nuevo, sin necesitar una terminal local. No vive bajo
 * /api/admin a propósito: hace falta poder llamarlo antes de que exista
 * ningún AdminUser con el que iniciar sesión. Se protege con SEED_SECRET en
 * vez de sesión. Es idempotente: llamarlo de nuevo no duplica nada.
 */
export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SEED_SECRET no está configurado en el proyecto" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Secreto inválido" }, { status: 401 });
  }

  const result = await seedDatabase(prisma);
  return NextResponse.json({ ok: true, result });
}
