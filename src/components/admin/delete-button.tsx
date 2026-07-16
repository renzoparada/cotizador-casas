"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function DeleteButton({ apiPath, confirmMessage }: { apiPath: string; confirmMessage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    const res = await fetch(apiPath, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      window.alert("No se pudo eliminar");
    }
  }

  return (
    <Button type="button" variant="danger" onClick={handleClick} disabled={loading}>
      {loading ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
