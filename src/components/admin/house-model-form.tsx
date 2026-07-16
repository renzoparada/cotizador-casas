"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/admin/image-picker";

export interface HouseModelFormValues {
  id?: string;
  name: string;
  tagline: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: number;
  pricePerM2Usd: number;
  order: number;
  active: boolean;
  hasImage?: boolean;
}

export function HouseModelForm({ initial }: { initial?: HouseModelFormValues }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const url = isEdit ? `/api/admin/house-models/${initial!.id}` : "/api/admin/house-models";

    const res = await fetch(url, { method: isEdit ? "PUT" : "POST", body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      setSubmitting(false);
      return;
    }

    router.push("/admin/house-models");
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
          <Label htmlFor="tagline">Descripción corta</Label>
          <Textarea id="tagline" name="tagline" rows={2} defaultValue={initial?.tagline} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms">Habitaciones</Label>
            <Input id="bedrooms" name="bedrooms" defaultValue={initial?.bedrooms} placeholder="Ej: 2 habitaciones (1 en suite)" />
          </div>
          <div>
            <Label htmlFor="bathrooms">Baños</Label>
            <Input id="bathrooms" name="bathrooms" defaultValue={initial?.bathrooms} placeholder="Ej: 1 baño en suite + 1 de visita" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="areaM2">Área (m²)</Label>
            <Input id="areaM2" name="areaM2" type="number" step="0.01" min="0" required defaultValue={initial?.areaM2} />
          </div>
          <div>
            <Label htmlFor="pricePerM2Usd">Precio por m² (USD)</Label>
            <Input
              id="pricePerM2Usd"
              name="pricePerM2Usd"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initial?.pricePerM2Usd}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="order">Orden</Label>
            <Input id="order" name="order" type="number" step="1" defaultValue={initial?.order ?? 0} />
          </div>
          <div>
            <Label htmlFor="active">Estado</Label>
            <Select id="active" name="active" defaultValue={String(initial?.active ?? true)}>
              <option value="true">Activo (visible en el sitio)</option>
              <option value="false">Inactivo (oculto)</option>
            </Select>
          </div>
        </div>
        <ImagePicker currentImageUrl={initial?.hasImage ? `/api/images/house-models/${initial.id}` : null} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/house-models")}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
