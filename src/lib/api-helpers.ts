import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Resuelve el AdminUser autenticado. Lanza ApiError si no hay sesión. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("No autenticado", 401);
  }
  return { adminId: session.user.id };
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
