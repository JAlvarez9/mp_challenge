import {
  ReportesRepository,
  IEstadisticas,
  IExpedienteReporte,
  IEstadisticasUsuario,
} from "../repositories/ReportesRepository";

export class ReportesService {
  private reportesRepository: ReportesRepository;

  constructor() {
    this.reportesRepository = new ReportesRepository();
  }

  async obtenerEstadisticas(
    fechaInicio?: string,
    fechaFin?: string,
    estado?: string
  ): Promise<IEstadisticas> {
    return await this.reportesRepository.obtenerEstadisticas(
      fechaInicio,
      fechaFin,
      estado
    );
  }

  async obtenerReporteDetallado(
    fechaInicio?: string,
    fechaFin?: string,
    estado?: string
  ): Promise<IExpedienteReporte[]> {
    return await this.reportesRepository.obtenerReporteDetallado(
      fechaInicio,
      fechaFin,
      estado
    );
  }

  async obtenerEstadisticasPorUsuario(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<IEstadisticasUsuario[]> {
    return await this.reportesRepository.obtenerEstadisticasPorUsuario(
      fechaInicio,
      fechaFin
    );
  }
}
