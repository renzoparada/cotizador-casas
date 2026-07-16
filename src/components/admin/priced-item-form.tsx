"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/admin/image-picker";

export interface PricedItemFormValues {
  id?: string;
  name: string;
  description: string;
  priceUsd: number;
  order: number;
  active: boolean;
  hasImage?: boolean;
}

/** Formulario compartido por techos y accesorios: mismos campos (nombre, descripción, precio, orden, estado, foto). */
export function PricedItemForm({
  initial,
  apiBase,
  imageBase,
  listPath,
}: {
  initial?: PricedItemFormValues;
  apiBase: string;
  imageBase: string;
  listPath: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const url = isEdit ? `${apiBase}/${initial!.id}` : apiBase;

    const res = await fetch(url, { method: isEdit ? "PUT" : "POST", body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      setSubmitting(false);
      return;
    }

    router.push(listPath);
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required defaultValue={initial?.name} />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={initial?.description} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priceUsd">Precio (USD)</Label>
            <Input id="priceUsd" name="priceUsd" type="number" step="0.01" min="0" required defaultValue={initial?.priceUsd} />
          </div>
          <div>
            <Label htmlFor="order">Orden</Label>
            <Input id="order" name="order" type="number" step="1" defaultValue={initial?.order ?? 0} />
          </div>
        </div>
        <div>
          <Label htmlFor="active">Estado</Label>
          <Select id="active" name="active" defaultValue={String(initial?.active ?? true)}>
            <option value="true">Activo (visible en el sitio)</option>
            <option value="false">Inactivo (oculto)</option>
          </Select>
        </div>
        <ImagePicker currentImageUrl={initial?.hasImage ? `${imageBase}/${initial.id}` : null} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push(listPath)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
