import { Router } from "express";
import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";

const router = Router();

/**
 * Configuración de rutas principales de la API
 */

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas de usuarios
router.use("/usuarios", usuarioRoutes);

// Ruta de verificación de salud del API
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

export default router;
