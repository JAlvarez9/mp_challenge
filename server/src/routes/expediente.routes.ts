import { Router } from "express";
import { ExpedienteController } from "../controllers/ExpedienteController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const expedienteController = new ExpedienteController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear expediente (cualquier usuario autenticado puede crear)
router.post("/", expedienteController.crear);

// Obtener todos los expedientes (USER ve solo los suyos, ADMIN/MODERADOR ven todos)
router.get("/", expedienteController.obtenerTodos);

// Obtener expediente por ID (verifica acceso dentro del controller)
router.get("/:id", expedienteController.obtenerPorId);

// Actualizar expediente (verifica acceso dentro del controller)
router.put("/:id", expedienteController.actualizar);

// Enviar expediente a revisión (verifica acceso dentro del controller)
router.post("/:id/revision", expedienteController.enviarARevision);

// Eliminar expediente (verifica acceso dentro del controller)
router.delete("/:id", expedienteController.eliminar);

export default router;
