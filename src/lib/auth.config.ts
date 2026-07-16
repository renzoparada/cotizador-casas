import type { NextAuthConfig } from "next-auth";

/**
 * Configuración "edge-safe": sin providers ni acceso a Prisma, para que
 * el proxy (que corre en el Edge Runtime) pueda validar la sesión sin
 * intentar cargar el cliente de base de datos.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
