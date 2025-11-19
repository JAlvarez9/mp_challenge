import { body } from "express-validator";

/**
 * Validaciones para el registro de usuario
 */
export const registroValidation = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("Debe ser un correo válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("rol")
    .optional()
    .isIn(["ADMIN", "USER", "MODERADOR"])
    .withMessage("El rol debe ser ADMIN, USER o MODERADOR"),
];

/**
 * Validaciones para el login
 */
export const loginValidation = [
  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("Debe ser un correo válido")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es requerida"),
];
