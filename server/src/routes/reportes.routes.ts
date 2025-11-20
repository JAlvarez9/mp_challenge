import { Router } from "express";
import { ReportesController } from "../controllers/ReportesController";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { RolUsuario } from "../types/enums";

const router = Router();
const reportesController = new ReportesController();

// Todas las rutas requieren autenticación y rol ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(RolUsuario.ADMIN));

// GET /api/reportes/estadisticas
router.get("/estadisticas", reportesController.obtenerEstadisticas);

// GET /api/reportes/detallado
router.get("/detallado", reportesController.obtenerReporteDetallado);

// GET /api/reportes/usuarios
router.get("/usuarios", reportesController.obtenerEstadisticasPorUsuario);

export default router;
