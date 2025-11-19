import { Request } from "express";

/**
 * Extensión de la interfaz Request de Express
 * para incluir información del usuario autenticado
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    correo: string;
    rol: string;
  };
}

/**
 * Payload del JWT
 */
export interface JWTPayload {
  id: string;
  correo: string;
  rol: string;
}
