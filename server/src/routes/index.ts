import { Router } from "express";
import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";
import expedienteRoutes from "./expediente.routes";
import indicioRoutes from "./indicio.routes";
import revisionRoutes from "./revision.routes";

const router = Router();

/**
 * Configuración de rutas principales de la API
 */

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas de usuarios
router.use("/usuarios", usuarioRoutes);

// Rutas de expedientes
router.use("/expedientes", expedienteRoutes);

// Rutas de indicios
router.use("/indicios", indicioRoutes);

// Rutas de revisiones
router.use("/revisiones", revisionRoutes);

// Ruta de verificación de salud del API
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

export default router;
