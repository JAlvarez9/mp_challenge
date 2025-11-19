import { Request, Response } from "express";
import { RevisionService } from "../services/RevisionService";

export class RevisionController {
  private revisionService: RevisionService;

  constructor() {
    this.revisionService = new RevisionService();
  }

  aprobar = async (req: Request, res: Response) => {
    try {
      const { expedienteId } = req.params;
      const { comentarios } = req.body;
      const coordinadorId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;
      const usuarioActual = (req as any).user.id;

      if (!expedienteId) {
        return res.status(400).json({
          success: false,
          message: "expedienteId es requerido",
        });
      }

      // Solo ADMIN y MODERADOR pueden aprobar
      if (rolUsuario !== "ADMIN" && rolUsuario !== "MODERADOR") {
        return res.status(403).json({
          success: false,
          message: "No tiene permiso para aprobar expedientes",
        });
      }

      const expediente = await this.revisionService.aprobar(
        expedienteId,
        coordinadorId,
        comentarios,
        usuarioActual
      );

      return res.status(200).json({
        success: true,
        message: "Expediente aprobado exitosamente",
        data: { expediente },
      });
    } catch (error: any) {
      console.error("Error al aprobar expediente:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al aprobar el expediente",
      });
    }
  };

  rechazar = async (req: Request, res: Response) => {
    try {
      const { expedienteId } = req.params;
      const { comentarios } = req.body;
      const coordinadorId = (req as any).user.id;
      const rolUsuario = (req as any).user.rol;
      const usuarioActual = (req as any).user.id;

      if (!expedienteId) {
        return res.status(400).json({
          success: false,
          message: "expedienteId es requerido",
        });
      }

      // Solo ADMIN y MODERADOR pueden rechazar
      if (rolUsuario !== "ADMIN" && rolUsuario !== "MODERADOR") {
        return res.status(403).json({
          success: false,
          message: "No tiene permiso para rechazar expedientes",
        });
      }

      if (!comentarios || comentarios.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar comentarios al rechazar un expediente",
        });
      }

      const expediente = await this.revisionService.rechazar(
        expedienteId,
        coordinadorId,
        comentarios,
        usuarioActual
      );

      return res.status(200).json({
        success: true,
        message: "Expediente rechazado exitosamente",
        data: { expediente },
      });
    } catch (error: any) {
      console.error("Error al rechazar expediente:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al rechazar el expediente",
      });
    }
  };

  obtenerHistorial = async (req: Request, res: Response) => {
    try {
      const { expedienteId } = req.params;

      if (!expedienteId) {
        return res.status(400).json({
          success: false,
          message: "expedienteId es requerido",
        });
      }

      const historial = await this.revisionService.obtenerHistorial(
        expedienteId
      );

      return res.status(200).json({
        success: true,
        message: "Historial de revisiones obtenido exitosamente",
        data: { historial },
      });
    } catch (error: any) {
      console.error("Error al obtener historial de revisiones:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener el historial de revisiones",
      });
    }
  };
}
