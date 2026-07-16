"use client";

import { useState } from "react";
import { Label } from "@/components/ui";

export function ImagePicker({ currentImageUrl }: { currentImageUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  const displayUrl = preview ?? currentImageUrl ?? null;

  return (
    <div>
      <Label htmlFor="image">Foto</Label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview de un archivo recién elegido o de la imagen guardada, no es una imagen optimizable por next/image
            <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">Sin foto</span>
          )}
        </div>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500 dark:text-slate-300"
        />
      </div>
    </div>
  );
}
