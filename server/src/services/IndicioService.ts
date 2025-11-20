import {
  IndicioRepository,
  IIndicio,
  CrearIndicioDTO,
  ActualizarIndicioDTO,
} from "../repositories/IndicioRepository";

export class IndicioService {
  private indicioRepository: IndicioRepository;

  constructor() {
    this.indicioRepository = new IndicioRepository();
  }

  async crear(
    expedienteId: string,
    numeroIndicio: string,
    descripcion: string,
    color: string | undefined,
    tamano: string | undefined,
    peso: number | undefined,
    ubicacion: string | undefined,
    observaciones: string | undefined,
    usuarioRegistroId: string,
    usuarioActual: string
  ): Promise<IIndicio> {
    const data: CrearIndicioDTO = {
      expedienteId,
      numeroIndicio,
      descripcion,
      color,
      tamano,
      peso,
      ubicacion,
      observaciones,
      usuarioRegistroId,
      createdBy: usuarioActual,
    };

    return await this.indicioRepository.crear(data);
  }

  async obtenerPorExpediente(expedienteId: string): Promise<IIndicio[]> {
    return await this.indicioRepository.obtenerPorExpediente(expedienteId);
  }

  async obtenerPorId(id: string): Promise<IIndicio | null> {
    return await this.indicioRepository.obtenerPorId(id);
  }

  async actualizar(
    id: string,
    descripcion: string | undefined,
    color: string | undefined,
    tamano: string | undefined,
    peso: number | undefined,
    ubicacion: string | undefined,
    observaciones: string | undefined,
    usuarioActual: string
  ): Promise<IIndicio> {
    const data: ActualizarIndicioDTO = {
      descripcion,
      color,
      tamano,
      peso,
      ubicacion,
      observaciones,
      updatedBy: usuarioActual,
    };

    return await this.indicioRepository.actualizar(id, data);
  }

  async eliminar(id: string, usuarioActual: string): Promise<boolean> {
    return await this.indicioRepository.eliminar(id, usuarioActual);
  }
}
