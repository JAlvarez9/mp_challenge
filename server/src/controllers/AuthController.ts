import { Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../types";

/**
 * Controlador de autenticación
 * Maneja los endpoints de registro y login
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario
   */
  register = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { nombre, correo, password, rol } = req.body;

      const resultado = await this.authService.registrar(
        nombre,
        correo,
        password,
        rol
      );

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          usuario: resultado.usuario,
          token: resultado.token,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al registrar usuario",
        });
      }
    }
  };

  /**
   * POST /api/auth/login
   * Autentica un usuario y devuelve un token JWT
   */
  login = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { correo, password } = req.body;

      const resultado = await this.authService.login(correo, password);

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: {
          usuario: resultado.usuario,
          token: resultado.token,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al iniciar sesión",
        });
      }
    }
  };

  /**
   * GET /api/auth/me
   * Obtiene información del usuario autenticado
   */
  me = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "No autenticado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener información del usuario",
      });
    }
  };
}
