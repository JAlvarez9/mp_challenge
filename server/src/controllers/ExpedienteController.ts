import { Request, Response } from "express";
import { ExpedienteService } from "../services/ExpedienteService";

export class ExpedienteController {
  private expedienteService: ExpedienteService;

  constructor() {
    this.expedienteService = new ExpedienteService();
  }

  crear = async (req: Request, res: Response) => {
    try {
      const { numeroExpediente, descripcion } = req.body;
      const usuarioId = (req as any).user.id;
      const usuarioActual = (req as any).user.id;

      if (!numeroExpediente) {
        return res.status(400).json({
          success: false,
          message: "El número de expediente es requerido",
        });
      }

      const expediente = await this.expedienteService.crear(
        numeroExpediente,
        descripcion,
        usuarioId,
        usuarioActual
      );

      return res.status(201).json({
        success: true,
        message: "Expediente creado exitosamente",
        data: { expediente },
      });
    } catch (error: any) {
      console.error("Error al crear expediente:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al crear el expediente",
      });
    }
  };

  obtenerTodos = async (req: Request, res: Response) => {
    try {
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;

      const expedientes = await this.expedienteService.obtenerTodos(
        usuarioId,
        rolUsuario
      );

      return res.status(200).json({
        success: true,
        message: "Expedientes obtenidos exitosamente",
        data: { expedientes },
      });
    } catch (error: any) {
      console.error("Error al obtener expedientes:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener expedientes",
      });
    }
  };

  obtenerPorId = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id es requerido",
        });
      }

      // Verificar acceso
      const tieneAcceso = await this.expedienteService.verificarAcceso(
        id,
        usuarioId,
        rolUsuario
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: "No tiene permiso para acceder a este expediente",
        });
      }

      const expediente = await this.expedienteService.obtenerPorId(id);

      if (!expediente) {
        return res.status(404).json({
          success: false,
          message: "Expediente no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Expediente obtenido exitosamente",
        data: { expediente },
      });
    } catch (error: any) {
      console.error("Error al obtener expediente:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener el expediente",
      });
    }
  };

  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;
      const usuarioActual = (req as any).user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id es requerido",
        });
      }

      // Solo el creador puede editar el expediente
      const esCreador = await this.expedienteService.verificarEsCreador(
        id,
        usuarioId
      );
      if (!esCreador) {
        return res.status(403).json({
          success: false,
          message: "Solo el creador del expediente puede editarlo",
        });
      }

      const expediente = await this.expedienteService.actualizar(
        id,
        descripcion,
        usuarioActual
      );

      return res.status(200).json({
        success: true,
        message: "Expediente actualizado exitosamente",
        data: { expediente },
      });
    } catch (error: any) {
      console.error("Error al actualizar expediente:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar el expediente",
      });
    }
  };

  enviarARevision = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;
      const usuarioActual = (req as any).user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id es requerido",
        });
      }

      // Solo el creador puede enviar a revisión
      const esCreador = await this.expedienteService.verificarEsCreador(
        id,
        usuarioId
      );
      if (!esCreador) {
        return res.status(403).json({
          success: false,
          message: "Solo el creador del expediente puede enviarlo a revisión",
        });
      }

      const expediente = await this.expedienteService.enviarARevision(
        id,
        usuarioActual
      );

      return res.status(200).json({
        success: true,
        message: "Expediente enviado a revisión exitosamente",
        data: { expediente },
      });
    } catch (error: any) {
      console.error("Error al enviar expediente a revisión:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al enviar el expediente a revisión",
      });
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;
      const usuarioActual = (req as any).user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id es requerido",
        });
      }

      // Verificar acceso
      const tieneAcceso = await this.expedienteService.verificarAcceso(
        id,
        usuarioId,
        rolUsuario
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: "No tiene permiso para eliminar este expediente",
        });
      }

      await this.expedienteService.eliminar(id, usuarioActual);

      return res.status(200).json({
        success: true,
        message: "Expediente eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar expediente:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar el expediente",
      });
    }
  };
}
