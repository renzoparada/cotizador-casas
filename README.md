# Cotizador de Casas

Página de ventas donde el cliente arma la cotización de su casa (modelo,
techo, accesorios) y ve el precio al instante en USD y Bs, con la opción de
financiar en cuotas mensuales (sistema francés, como un banco). Al dejar sus
datos, el lead queda guardado en la base de datos y el cliente descarga un
PDF con el detalle.

Un panel `/admin` (protegido por login) permite editar los modelos de casa,
techos y accesorios —incluyendo sus fotos—, además de la configuración de
precios: tipo de cambio Bs/USD, tasa de interés anual y rango de cuota
inicial.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- PostgreSQL vía Prisma 7
- NextAuth (credentials) para el login de `/admin`
- jsPDF + jspdf-autotable para la cotización descargable

## Desarrollo local

```bash
cp .env.example .env   # completá DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npx prisma migrate deploy
npm run db:seed         # crea el usuario admin y datos de ejemplo
npm run dev
```

- Sitio público: http://localhost:3000
- Panel admin: http://localhost:3000/admin/login

## Editar precios y financiamiento

Los modelos de casa, techos y accesorios (nombre, precio, foto, orden,
activo/inactivo) se editan desde `/admin`. El tipo de cambio Bs/USD, la tasa
de interés anual y el rango de cuota inicial se editan desde
`/admin/settings`. Los cambios se reflejan al instante en el sitio público,
sin necesidad de un nuevo build.

## Docker

```bash
cp .env.example .env   # completá AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d --build
docker compose exec app npm run db:seed
```
