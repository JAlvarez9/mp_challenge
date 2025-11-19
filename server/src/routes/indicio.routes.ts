import { Router } from "express";
import { IndicioController } from "../controllers/IndicioController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const indicioController = new IndicioController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear indicio (verifica acceso al expediente dentro del controller)
router.post("/", indicioController.crear);

// Obtener indicios por expediente (verifica acceso dentro del controller)
router.get("/expediente/:expedienteId", indicioController.obtenerPorExpediente);

// Actualizar indicio
router.put("/:id", indicioController.actualizar);

// Eliminar indicio
router.delete("/:id", indicioController.eliminar);

export default router;
