import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { RolUsuario } from "../types/enums";

/**
 * Middleware para verificar roles de usuario
 * Permite acceso solo a usuarios con los roles especificados
 */
export const roleMiddleware = (...rolesPermitidos: RolUsuario[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado.",
      });
      return;
    }

    const tienePermiso = rolesPermitidos.includes(req.user.rol as RolUsuario);

    if (!tienePermiso) {
      res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este recurso.",
      });
      return;
    }

    next();
  };
};
