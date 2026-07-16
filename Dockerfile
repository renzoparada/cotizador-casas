FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Aplica migraciones pendientes y arranca el servidor de producción.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
