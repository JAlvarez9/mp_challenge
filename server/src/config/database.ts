import * as sql from "mssql";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Configuración de conexión a SQL Server
 */
const config: sql.config = {
  server: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // SQL Server 2022 requiere cifrado
    trustServerCertificate: true, // Aceptar certificados autofirmados
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

/**
 * Pool de conexiones a la base de datos
 */
let pool: sql.ConnectionPool | null = null;

/**
 * Obtiene o crea el pool de conexiones
 */
export const getPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
    console.log("✅ Pool de conexiones a SQL Server creado");
  }
  return pool;
};

/**
 * Inicializa la conexión a la base de datos
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await getPool();
    console.log("✅ Conexión a SQL Server establecida correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a SQL Server:", error);
    throw error;
  }
};

/**
 * Cierra el pool de conexiones
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("✅ Conexión a SQL Server cerrada");
    }
  } catch (error) {
    console.error("❌ Error al cerrar la conexión:", error);
    throw error;
  }
};

export { sql };
