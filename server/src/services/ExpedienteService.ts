import {
  ExpedienteRepository,
  IExpediente,
  CrearExpedienteDTO,
  ActualizarExpedienteDTO,
} from "../repositories/ExpedienteRepository";
import { EstadoExpediente } from "../types/enums";

export class ExpedienteService {
  private expedienteRepository: ExpedienteRepository;

  constructor() {
    this.expedienteRepository = new ExpedienteRepository();
  }

  async crear(
    numeroExpediente: string,
    descripcion: string | undefined,
    usuarioRegistroId: string,
    usuarioActual: string
  ): Promise<IExpediente> {
    const data: CrearExpedienteDTO = {
      numeroExpediente,
      descripcion,
      usuarioRegistroId,
      createdBy: usuarioActual,
    };

    return await this.expedienteRepository.crear(data);
  }

  async obtenerTodos(
    usuarioId?: string,
    rolUsuario?: string
  ): Promise<IExpediente[]> {
    // Si es USER, solo ve sus expedientes
    const soloDelUsuario = rolUsuario === "USER";
    return await this.expedienteRepository.obtenerTodos(
      usuarioId,
      soloDelUsuario
    );
  }

  async obtenerPorId(id: string): Promise<IExpediente | null> {
    return await this.expedienteRepository.obtenerPorId(id);
  }

  async actualizar(
    id: string,
    descripcion: string | undefined,
    usuarioActual: string
  ): Promise<IExpediente> {
    const data: ActualizarExpedienteDTO = {
      descripcion,
      updatedBy: usuarioActual,
    };

    return await this.expedienteRepository.actualizar(id, data);
  }

  async enviarARevision(
    id: string,
    usuarioActual: string
  ): Promise<IExpediente> {
    return await this.expedienteRepository.cambiarEstado(
      id,
      EstadoExpediente.EN_REVISION,
      usuarioActual
    );
  }

  async eliminar(id: string, usuarioActual: string): Promise<boolean> {
    return await this.expedienteRepository.eliminar(id, usuarioActual);
  }

  async verificarAcceso(
    expedienteId: string,
    usuarioId: string,
    rolUsuario: string
  ): Promise<boolean> {
    const expediente = await this.obtenerPorId(expedienteId);

    if (!expediente) {
      return false;
    }

    // ADMIN y MODERADOR tienen acceso total
    if (rolUsuario === "ADMIN" || rolUsuario === "MODERADOR") {
      return true;
    }

    // USER solo accede a sus propios expedientes
    return expediente.usuarioRegistroId === usuarioId;
  }
}
