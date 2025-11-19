import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config";
import { initializeDatabase } from "./config/database";
import routes from "./routes";

/**
 * Configuración principal del servidor Express
 */
class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Configura los middlewares de Express
   */
  private initializeMiddlewares(): void {
    // CORS
    this.app.use(
      cors({
        origin: "*", // En producción, especificar dominios permitidos
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logger simple
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configura las rutas de la API
   */
  private initializeRoutes(): void {
    // Ruta raíz
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        success: true,
        message: "Bienvenido a la API",
        version: "1.0.0",
        endpoints: {
          health: "/api/health",
          auth: "/api/auth",
          usuarios: "/api/usuarios",
        },
      });
    });

    // Rutas de la API
    this.app.use("/api", routes);

    // Ruta 404
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
      });
    });
  }

  /**
   * Manejo global de errores
   */
  private initializeErrorHandling(): void {
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);

        res.status(500).json({
          success: false,
          message:
            config.nodeEnv === "development"
              ? err.message
              : "Error interno del servidor",
          ...(config.nodeEnv === "development" && { stack: err.stack }),
        });
      }
    );
  }

  /**
   * Inicia el servidor
   */
  async start(): Promise<void> {
    try {
      // Inicializar conexión a la base de datos
      await initializeDatabase();

      // Iniciar servidor
      this.app.listen(this.port, () => {
        console.log("===========================================");
        console.log(`🚀 Servidor iniciado correctamente`);
        console.log(`📍 Puerto: ${this.port}`);
        console.log(`🌍 Entorno: ${config.nodeEnv}`);
        console.log(`📡 URL: http://localhost:${this.port}`);
        console.log("===========================================");
      });
    } catch (error) {
      console.error("❌ Error al iniciar el servidor:", error);
      process.exit(1);
    }
  }
}

// Inicializar y arrancar el servidor
const server = new Server();
server.start();

// Manejo de errores no capturados
process.on("unhandledRejection", (reason: any) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
