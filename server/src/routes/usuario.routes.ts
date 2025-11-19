import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from "../middleware/role.middleware";
import { RolUsuario } from "../types/enums";
import { validateRequest } from "../middleware/validator.middleware";
import { body } from "express-validator";

const router = Router();
const usuarioController = new UsuarioController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/usuarios
 * @desc    Obtener todos los usuarios
 * @access  Private (Admin, Moderador)
 */
router.get(
  "/",
  roleMiddleware(RolUsuario.ADMIN, RolUsuario.MODERADOR),
  usuarioController.obtenerTodos
);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Admin, Moderador)
 */
router.get(
  "/:id",
  roleMiddleware(RolUsuario.ADMIN, RolUsuario.MODERADOR),
  usuarioController.obtenerPorId
);

/**
 * @route   POST /api/usuarios
 * @desc    Crear nuevo usuario
 * @access  Private (Solo Admin)
 */
router.post(
  "/",
  roleMiddleware(RolUsuario.ADMIN),
  [
    body("nombre").trim().notEmpty().withMessage("El nombre es requerido"),
    body("correo").trim().isEmail().withMessage("Correo inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("rol")
      .isIn(["ADMIN", "USER", "MODERADOR"])
      .withMessage("Rol inválido"),
    validateRequest,
  ],
  usuarioController.crear
);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar usuario
 * @access  Private (Solo Admin)
 */
router.put(
  "/:id",
  roleMiddleware(RolUsuario.ADMIN),
  [
    body("nombre")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre no puede estar vacío"),
    body("correo").optional().trim().isEmail().withMessage("Correo inválido"),
    body("rol")
      .optional()
      .isIn(["ADMIN", "USER", "MODERADOR"])
      .withMessage("Rol inválido"),
    validateRequest,
  ],
  usuarioController.actualizar
);

/**
 * @route   PUT /api/usuarios/:id/cambiar-password
 * @desc    Cambiar contraseña de usuario
 * @access  Private
 */
router.put(
  "/:id/cambiar-password",
  [
    body("passwordActual")
      .notEmpty()
      .withMessage("La contraseña actual es requerida"),
    body("passwordNuevo")
      .isLength({ min: 6 })
      .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
    validateRequest,
  ],
  usuarioController.cambiarPassword
);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Desactivar usuario
 * @access  Private (Solo Admin)
 */
router.delete(
  "/:id",
  roleMiddleware(RolUsuario.ADMIN),
  usuarioController.desactivar
);

/**
 * @route   PUT /api/usuarios/:id/activar
 * @desc    Activar usuario
 * @access  Private (Solo Admin)
 */
router.put(
  "/:id/activar",
  roleMiddleware(RolUsuario.ADMIN),
  usuarioController.activar
);

export default router;
