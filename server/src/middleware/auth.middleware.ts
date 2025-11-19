import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthRequest, JWTPayload } from "../types";

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y extrae la información del usuario
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token no proporcionado. Acceso denegado.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token no proporcionado. Acceso denegado.",
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(
      token,
      config.jwt.secret as string
    ) as unknown as JWTPayload;

    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expirado. Por favor, inicia sesión nuevamente.",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Token inválido. Acceso denegado.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al verificar el token.",
    });
  }
};
