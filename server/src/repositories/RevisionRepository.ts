import { getPool, sql } from "../config/database";
import { IExpediente } from "./ExpedienteRepository";

export interface IHistorialRevision {
  id: string;
  expedienteId: string;
  usuarioRevisorId: string;
  accion: string;
  comentarios?: string;
  fechaRevision: Date;
  revisorNombre?: string;
  revisorCorreo?: string;
  revisorRol?: string;
}

export class RevisionRepository {
  async aprobar(
    expedienteId: string,
    coordinadorId: string,
    comentarios: string | undefined,
    updatedBy: string
  ): Promise<IExpediente> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("expedienteId", sql.UniqueIdentifier, expedienteId)
        .input("coordinadorId", sql.UniqueIdentifier, coordinadorId)
        .input("comentarios", sql.NVarChar(1000), comentarios || null)
        .input("updatedBy", sql.NVarChar(255), updatedBy)
        .execute("sp_aprobar_expediente");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50301) throw new Error("Expediente no encontrado");
      if (error.number === 50302)
        throw new Error(
          "Solo se pueden aprobar expedientes en estado EN_REVISION"
        );
      throw error;
    }
  }

  async rechazar(
    expedienteId: string,
    coordinadorId: string,
    comentarios: string,
    updatedBy: string
  ): Promise<IExpediente> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("expedienteId", sql.UniqueIdentifier, expedienteId)
        .input("coordinadorId", sql.UniqueIdentifier, coordinadorId)
        .input("comentarios", sql.NVarChar(1000), comentarios)
        .input("updatedBy", sql.NVarChar(255), updatedBy)
        .execute("sp_rechazar_expediente");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50303) throw new Error("Expediente no encontrado");
      if (error.number === 50304)
        throw new Error(
          "Solo se pueden rechazar expedientes en estado EN_REVISION"
        );
      if (error.number === 50305)
        throw new Error(
          "Debe proporcionar comentarios al rechazar un expediente"
        );
      throw error;
    }
  }

  async obtenerHistorial(expedienteId: string): Promise<IHistorialRevision[]> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("expedienteId", sql.UniqueIdentifier, expedienteId)
      .execute("sp_obtener_historial_revisiones");

    return result.recordset;
  }
}
