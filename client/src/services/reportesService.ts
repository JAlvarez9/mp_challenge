import axios from "../lib/axios";

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
  expedienteId: number;
  numeroExpediente: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fechaRegistro: string;
  fechaActualizacion: string;
  usuarioRegistroId: number;
  usuarioRegistroNombre: string;
  usuarioRegistroEmail: string;
  coordinadorId: number | null;
  coordinadorNombre: string | null;
  coordinadorEmail: string | null;
  totalIndicios: number;
  ultimaRevision: string | null;
  totalRevisiones: number;
  fechaEnvioRevision: string | null;
  fechaAprobacion: string | null;
  fechaRechazo: string | null;
  comentariosAprobacion: string | null;
  comentariosRechazo: string | null;
  activo: boolean;
}

export interface IEstadisticasUsuario {
  usuarioId: number;
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

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
}

class ReportesService {
  async obtenerEstadisticas(filtros?: FiltrosReporte): Promise<IEstadisticas> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
    if (filtros?.fechaFin) params.append("fechaFin", filtros.fechaFin);
    if (filtros?.estado) params.append("estado", filtros.estado);

    const response = await axios.get(
      `/reportes/estadisticas?${params.toString()}`
    );
    const estadisticas = response.data.data.estadisticas;

    // Asegurar que todos los valores numéricos sean válidos
    return {
      totalExpedientes: estadisticas?.totalExpedientes ?? 0,
      totalBorrador: estadisticas?.totalBorrador ?? 0,
      totalEnRevision: estadisticas?.totalEnRevision ?? 0,
      totalAprobados: estadisticas?.totalAprobados ?? 0,
      totalRechazados: estadisticas?.totalRechazados ?? 0,
      porcentajeAprobacion: estadisticas?.porcentajeAprobacion ?? 0,
      porcentajeRechazo: estadisticas?.porcentajeRechazo ?? 0,
      totalIndicios: estadisticas?.totalIndicios ?? 0,
      promedioIndiciosPorExpediente:
        estadisticas?.promedioIndiciosPorExpediente ?? 0,
      totalRevisiones: estadisticas?.totalRevisiones ?? 0,
    };
  }

  async obtenerReporteDetallado(
    filtros?: FiltrosReporte
  ): Promise<IExpedienteReporte[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
    if (filtros?.fechaFin) params.append("fechaFin", filtros.fechaFin);
    if (filtros?.estado) params.append("estado", filtros.estado);

    const response = await axios.get(
      `/reportes/detallado?${params.toString()}`
    );
    return response.data.data.expedientes;
  }

  async obtenerEstadisticasPorUsuario(
    filtros?: Omit<FiltrosReporte, "estado">
  ): Promise<IEstadisticasUsuario[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
    if (filtros?.fechaFin) params.append("fechaFin", filtros.fechaFin);

    const response = await axios.get(`/reportes/usuarios?${params.toString()}`);
    return response.data.data.usuarios;
  }
}

export const reportesService = new ReportesService();
