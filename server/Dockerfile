# Etapa 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Production
FROM node:24-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Variable de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]
