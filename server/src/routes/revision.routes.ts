import { Router } from "express";
import { RevisionController } from "../controllers/RevisionController";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { RolUsuario } from "../types/enums";

const router = Router();
const revisionController = new RevisionController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aprobar expediente (solo ADMIN y MODERADOR)
router.post(
  "/:expedienteId/aprobar",
  roleMiddleware(RolUsuario.ADMIN, RolUsuario.MODERADOR),
  revisionController.aprobar
);

// Rechazar expediente (solo ADMIN y MODERADOR)
router.post(
  "/:expedienteId/rechazar",
  roleMiddleware(RolUsuario.ADMIN, RolUsuario.MODERADOR),
  revisionController.rechazar
);

// Obtener historial de revisiones (cualquier usuario autenticado)
router.get("/:expedienteId/historial", revisionController.obtenerHistorial);

export default router;
