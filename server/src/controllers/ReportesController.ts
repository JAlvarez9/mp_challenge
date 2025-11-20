import { Request, Response } from "express";
import { ReportesService } from "../services/ReportesService";

export class ReportesController {
  private reportesService: ReportesService;

  constructor() {
    this.reportesService = new ReportesService();
  }

  obtenerEstadisticas = async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, estado } = req.query;

      const estadisticas = await this.reportesService.obtenerEstadisticas(
        fechaInicio as string | undefined,
        fechaFin as string | undefined,
        estado as string | undefined
      );

      return res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas exitosamente",
        data: { estadisticas },
      });
    } catch (error: any) {
      console.error("Error al obtener estadísticas:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener estadísticas",
      });
    }
  };

  obtenerReporteDetallado = async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, estado } = req.query;

      const expedientes = await this.reportesService.obtenerReporteDetallado(
        fechaInicio as string | undefined,
        fechaFin as string | undefined,
        estado as string | undefined
      );

      return res.status(200).json({
        success: true,
        message: "Reporte obtenido exitosamente",
        data: { expedientes },
      });
    } catch (error: any) {
      console.error("Error al obtener reporte:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener reporte",
      });
    }
  };

  obtenerEstadisticasPorUsuario = async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const usuarios = await this.reportesService.obtenerEstadisticasPorUsuario(
        fechaInicio as string | undefined,
        fechaFin as string | undefined
      );

      return res.status(200).json({
        success: true,
        message: "Estadísticas por usuario obtenidas exitosamente",
        data: { usuarios },
      });
    } catch (error: any) {
      console.error("Error al obtener estadísticas por usuario:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener estadísticas por usuario",
      });
    }
  };
}
