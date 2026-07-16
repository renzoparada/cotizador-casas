import { ApiError } from "@/lib/api-helpers";

export interface ParsedImage {
  data: Uint8Array<ArrayBuffer>;
  mimeType: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Lee un campo de archivo de un FormData de admin. Devuelve null si no se mandó imagen nueva. */
export async function extractImage(form: FormData, field = "image"): Promise<ParsedImage | null> {
  const file = form.get(field);
  if (!(file instanceof File) || file.size === 0) return null;

  if (!file.type.startsWith("image/")) {
    throw new ApiError("El archivo debe ser una imagen", 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError("La imagen no puede superar 5MB", 400);
  }

  const data = new Uint8Array(await file.arrayBuffer()) as Uint8Array<ArrayBuffer>;
  return { data, mimeType: file.type };
}

/** Convierte un FormData a un objeto plano de strings, para validar con zod. */
export function formDataToObject(form: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") obj[key] = value;
  }
  return obj;
}
