import {
  RevisionRepository,
  IHistorialRevision,
} from "../repositories/RevisionRepository";
import { IExpediente } from "../repositories/ExpedienteRepository";

export class RevisionService {
  private revisionRepository: RevisionRepository;

  constructor() {
    this.revisionRepository = new RevisionRepository();
  }

  async aprobar(
    expedienteId: string,
    coordinadorId: string,
    comentarios: string | undefined,
    usuarioActual: string
  ): Promise<IExpediente> {
    return await this.revisionRepository.aprobar(
      expedienteId,
      coordinadorId,
      comentarios,
      usuarioActual
    );
  }

  async rechazar(
    expedienteId: string,
    coordinadorId: string,
    comentarios: string,
    usuarioActual: string
  ): Promise<IExpediente> {
    if (!comentarios || comentarios.trim() === "") {
      throw new Error(
        "Debe proporcionar comentarios al rechazar un expediente"
      );
    }

    return await this.revisionRepository.rechazar(
      expedienteId,
      coordinadorId,
      comentarios,
      usuarioActual
    );
  }

  async obtenerHistorial(expedienteId: string): Promise<IHistorialRevision[]> {
    return await this.revisionRepository.obtenerHistorial(expedienteId);
  }
}
