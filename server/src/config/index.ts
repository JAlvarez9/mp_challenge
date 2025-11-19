import * as dotenv from "dotenv";

dotenv.config();

// Validar variables de entorno críticas
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET debe estar definido en producción");
}

/**
 * Variables de entorno y configuración global de la aplicación
 */
export const config = {
  // Configuración del servidor
  port: parseInt(process.env.PORT || "3000"),
  nodeEnv: process.env.NODE_ENV || "development",

  // Configuración de JWT
  jwt: {
    secret: (process.env.JWT_SECRET ||
      "default_secret_change_this_in_production") as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as string,
  },

  // Configuración de la base de datos
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
};
