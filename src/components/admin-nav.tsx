"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import { Button } from "@/components/ui";

const LINKS = [
  { href: "/admin", label: "Panel", exact: true },
  { href: "/admin/house-models", label: "Modelos de casa" },
  { href: "/admin/roof-upgrades", label: "Techos" },
  { href: "/admin/accessories", label: "Accesorios" },
  { href: "/admin/settings", label: "Configuración" },
  { href: "/admin/leads", label: "Cotizaciones" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <nav className="flex flex-wrap gap-1">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400" target="_blank">
            Ver sitio público
          </Link>
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
