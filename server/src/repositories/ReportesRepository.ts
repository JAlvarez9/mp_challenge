import { getPool, sql } from "../config/database";

export interface IEstadisticas {
  totalExpedientes: number;
  totalBorrador: number;
  totalEnRevision: number;
  totalAprobados: number;
  totalRechazados: number;
  porcentajeAprobacion: number;
  porcentajeRechazo: number;
  totalIndicios: number;
  promedioIndiciosPorExpediente: number;
  totalRevisiones: number;
}

export interface IExpedienteReporte {
  id: string;
  numeroExpediente: string;
  fechaRegistro: Date;
  descripcion?: string;
  estado: string;
  fechaRevision?: Date;
  comentariosRevision?: string;
  createdAt: Date;
  updatedAt: Date;
  usuarioRegistroId: string;
  usuarioRegistroNombre?: string;
  usuarioRegistroCorreo?: string;
  coordinadorId?: string;
  coordinadorNombre?: string;
  coordinadorCorreo?: string;
  totalIndicios: number;
  ultimaRevision?: Date;
  totalRevisiones: number;
}

export interface IEstadisticasUsuario {
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioRol: string;
  totalExpedientes: number;
  totalBorrador: number;
  totalEnRevision: number;
  totalAprobados: number;
  totalRechazados: number;
  totalIndiciosCreados: number;
}

export class ReportesRepository {
  async obtenerEstadisticas(
    fechaInicio?: string,
    fechaFin?: string,
    estado?: string
  ): Promise<IEstadisticas> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("fechaInicio", sql.DateTime2, fechaInicio || null)
      .input("fechaFin", sql.DateTime2, fechaFin || null)
      .input("estado", sql.NVarChar(20), estado || null)
      .execute("sp_obtener_estadisticas_expedientes");

    return result.recordset[0];
  }

  async obtenerReporteDetallado(
    fechaInicio?: string,
    fechaFin?: string,
    estado?: string
  ): Promise<IExpedienteReporte[]> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("fechaInicio", sql.DateTime2, fechaInicio || null)
      .input("fechaFin", sql.DateTime2, fechaFin || null)
      .input("estado", sql.NVarChar(20), estado || null)
      .execute("sp_obtener_reporte_detallado");

    return result.recordset;
  }

  async obtenerEstadisticasPorUsuario(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<IEstadisticasUsuario[]> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("fechaInicio", sql.DateTime2, fechaInicio || null)
      .input("fechaFin", sql.DateTime2, fechaFin || null)
      .execute("sp_obtener_estadisticas_por_usuario");

    return result.recordset;
  }
}
