import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from "../middleware/validator.middleware";
import { registroValidation, loginValidation } from "../utils/validations";

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  "/register",
  registroValidation,
  validateRequest,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post("/login", loginValidation, validateRequest, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get("/me", authMiddleware, authController.me);

export default router;
