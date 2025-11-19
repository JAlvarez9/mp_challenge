import { Request, Response } from "express";
import { IndicioService } from "../services/IndicioService";
import { ExpedienteService } from "../services/ExpedienteService";

export class IndicioController {
  private indicioService: IndicioService;
  private expedienteService: ExpedienteService;

  constructor() {
    this.indicioService = new IndicioService();
    this.expedienteService = new ExpedienteService();
  }

  crear = async (req: Request, res: Response) => {
    try {
      const {
        expedienteId,
        numeroIndicio,
        descripcion,
        color,
        tamano,
        peso,
        ubicacion,
        observaciones,
      } = req.body;
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;
      const usuarioActual = (req as any).user.id;

      if (!expedienteId || !numeroIndicio || !descripcion) {
        return res.status(400).json({
          success: false,
          message: "expedienteId, numeroIndicio y descripcion son requeridos",
        });
      }

      // Verificar acceso al expediente
      const tieneAcceso = await this.expedienteService.verificarAcceso(
        expedienteId,
        usuarioId,
        rolUsuario
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: "No tiene permiso para agregar indicios a este expediente",
        });
      }

      const indicio = await this.indicioService.crear(
        expedienteId,
        numeroIndicio,
        descripcion,
        color,
        tamano,
        peso,
        ubicacion,
        observaciones,
        usuarioId,
        usuarioActual
      );

      return res.status(201).json({
        success: true,
        message: "Indicio creado exitosamente",
        data: { indicio },
      });
    } catch (error: any) {
      console.error("Error al crear indicio:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al crear el indicio",
      });
    }
  };

  obtenerPorExpediente = async (req: Request, res: Response) => {
    try {
      const { expedienteId } = req.params;
      const usuarioId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;

      if (!expedienteId) {
        return res.status(400).json({
          success: false,
          message: "expedienteId es requerido",
        });
      }

      // Verificar acceso al expediente
      const tieneAcceso = await this.expedienteService.verificarAcceso(
        expedienteId,
        usuarioId,
        rolUsuario
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: "No tiene permiso para ver los indicios de este expediente",
        });
      }

      const indicios = await this.indicioService.obtenerPorExpediente(
        expedienteId
      );

      return res.status(200).json({
        success: true,
        message: "Indicios obtenidos exitosamente",
        data: { indicios },
      });
    } catch (error: any) {
      console.error("Error al obtener indicios:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los indicios",
      });
    }
  };

  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { descripcion, color, tamano, peso, ubicacion, observaciones } =
        req.body;
      const usuarioActual = (req as any).user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id es requerido",
        });
      }

      const indicio = await this.indicioService.actualizar(
        id,
        descripcion,
        color,
        tamano,
        peso,
        ubicacion,
        observaciones,
        usuarioActual
      );

      return res.status(200).json({
        success: true,
        message: "Indicio actualizado exitosamente",
        data: { indicio },
      });
    } catch (error: any) {
      console.error("Error al actualizar indicio:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar el indicio",
      });
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuarioActual = (req as any).user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id es requerido",
        });
      }

      await this.indicioService.eliminar(id, usuarioActual);

      return res.status(200).json({
        success: true,
        message: "Indicio eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar indicio:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar el indicio",
      });
    }
  };
}
