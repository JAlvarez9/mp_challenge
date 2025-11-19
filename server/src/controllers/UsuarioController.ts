import { Response, NextFunction } from "express";
import { UsuarioService } from "../services/UsuarioService";
import { AuthRequest } from "../types";

/**
 * Controlador de Usuario
 * Maneja los endpoints CRUD para usuarios
 */
export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  /**
   * GET /api/usuarios
   * Obtiene todos los usuarios
   */
  obtenerTodos = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarios = await this.usuarioService.obtenerTodos();

      res.status(200).json({
        success: true,
        data: usuarios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
      });
    }
  };

  /**
   * GET /api/usuarios/:id
   * Obtiene un usuario por ID
   */
  obtenerPorId = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: "ID requerido" });
        return;
      }

      const usuario = await this.usuarioService.obtenerPorId(id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener usuario",
      });
    }
  };

  /**
   * POST /api/usuarios
   * Crea un nuevo usuario
   */
  crear = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { nombre, correo, password, rol } = req.body;
      const usuarioActual = req.user?.correo || "sistema";

      const nuevoUsuario = await this.usuarioService.crear(
        nombre,
        correo,
        password,
        rol,
        usuarioActual
      );

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: nuevoUsuario,
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
          message: "Error al crear usuario",
        });
      }
    }
  };

  /**
   * PUT /api/usuarios/:id
   * Actualiza un usuario existente
   */
  actualizar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { nombre, correo, rol } = req.body;
      const usuarioActual = req.user?.correo || "sistema";

      if (!id) {
        res.status(400).json({ success: false, message: "ID requerido" });
        return;
      }

      const usuarioActualizado = await this.usuarioService.actualizar(
        id,
        { nombre, correo, rol },
        usuarioActual
      );

      if (!usuarioActualizado) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: usuarioActualizado,
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
          message: "Error al actualizar usuario",
        });
      }
    }
  };

  /**
   * PUT /api/usuarios/:id/cambiar-password
   * Cambia la contraseña de un usuario
   */
  cambiarPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNuevo } = req.body;
      const usuarioActual = req.user?.correo || "sistema";

      if (!id) {
        res.status(400).json({ success: false, message: "ID requerido" });
        return;
      }

      await this.usuarioService.cambiarPassword(
        id,
        passwordActual,
        passwordNuevo,
        usuarioActual
      );

      res.status(200).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
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
          message: "Error al cambiar contraseña",
        });
      }
    }
  };

  /**
   * DELETE /api/usuarios/:id
   * Desactiva un usuario (soft delete)
   */
  desactivar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const usuarioActual = req.user?.correo || "sistema";

      if (!id) {
        res.status(400).json({ success: false, message: "ID requerido" });
        return;
      }

      await this.usuarioService.desactivar(id, usuarioActual);

      res.status(200).json({
        success: true,
        message: "Usuario desactivado exitosamente",
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
          message: "Error al desactivar usuario",
        });
      }
    }
  };

  /**
   * PUT /api/usuarios/:id/activar
   * Reactiva un usuario
   */
  activar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const usuarioActual = req.user?.correo || "sistema";

      if (!id) {
        res.status(400).json({ success: false, message: "ID requerido" });
        return;
      }

      await this.usuarioService.activar(id, usuarioActual);

      res.status(200).json({
        success: true,
        message: "Usuario activado exitosamente",
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
          message: "Error al activar usuario",
        });
      }
    }
  };
}
