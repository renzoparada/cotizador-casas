import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Todo el sitio es público (es la página de ventas) excepto /admin y
 * /api/admin, que requieren haber iniciado sesión como AdminUser.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isAdminLoginPage;
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!req.auth) {
    if (isAdminApi) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    if (isAdminPage) {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (req.auth && isAdminLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
