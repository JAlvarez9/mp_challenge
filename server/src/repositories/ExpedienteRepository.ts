import { getPool, sql } from "../config/database";

export interface IExpediente {
  id: string;
  numeroExpediente: string;
  fechaRegistro: Date;
  descripcion?: string;
  estado: string;
  usuarioRegistroId: string;
  coordinadorId?: string;
  fechaRevision?: Date;
  comentariosRevision?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  usuarioRegistroNombre?: string;
  usuarioRegistroCorreo?: string;
  coordinadorNombre?: string;
  coordinadorCorreo?: string;
  totalIndicios?: number;
}

export interface CrearExpedienteDTO {
  numeroExpediente: string;
  descripcion?: string;
  usuarioRegistroId: string;
  createdBy: string;
}

export interface ActualizarExpedienteDTO {
  descripcion?: string;
  updatedBy: string;
}

export class ExpedienteRepository {
  async crear(data: CrearExpedienteDTO): Promise<IExpediente> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("numeroExpediente", sql.NVarChar(50), data.numeroExpediente)
        .input("descripcion", sql.NVarChar(500), data.descripcion || null)
        .input(
          "usuarioRegistroId",
          sql.UniqueIdentifier,
          data.usuarioRegistroId
        )
        .input("createdBy", sql.NVarChar(255), data.createdBy)
        .execute("sp_crear_expediente");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50101) {
        throw new Error("El número de expediente ya existe");
      }
      throw error;
    }
  }

  async obtenerTodos(
    usuarioId?: string,
    soloDelUsuario: boolean = false
  ): Promise<IExpediente[]> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("usuarioId", sql.UniqueIdentifier, usuarioId || null)
      .input("soloDelUsuario", sql.Bit, soloDelUsuario)
      .execute("sp_obtener_expedientes");

    return result.recordset;
  }

  async obtenerPorId(id: string): Promise<IExpediente | null> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .execute("sp_obtener_expediente_por_id");

    return result.recordset[0] || null;
  }

  async actualizar(
    id: string,
    data: ActualizarExpedienteDTO
  ): Promise<IExpediente> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("descripcion", sql.NVarChar(500), data.descripcion || null)
        .input("updatedBy", sql.NVarChar(255), data.updatedBy)
        .execute("sp_actualizar_expediente");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50102) {
        throw new Error("Expediente no encontrado");
      }
      if (error.number === 50103) {
        throw new Error("Solo se pueden editar expedientes en estado BORRADOR");
      }
      throw error;
    }
  }

  async cambiarEstado(
    id: string,
    nuevoEstado: string,
    updatedBy: string
  ): Promise<IExpediente> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("nuevoEstado", sql.NVarChar(20), nuevoEstado)
        .input("updatedBy", sql.NVarChar(255), updatedBy)
        .execute("sp_cambiar_estado_expediente");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50104) {
        throw new Error("Expediente no encontrado");
      }
      if (error.number === 50105) {
        throw new Error("Estado no válido");
      }
      if (error.number === 50106) {
        throw new Error(
          "El expediente debe tener al menos un indicio para enviarse a revisión"
        );
      }
      throw error;
    }
  }

  async eliminar(id: string, updatedBy: string): Promise<boolean> {
    const pool = await getPool();

    try {
      await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("updatedBy", sql.NVarChar(255), updatedBy)
        .execute("sp_eliminar_expediente");

      return true;
    } catch (error: any) {
      if (error.number === 50107) {
        throw new Error("Expediente no encontrado");
      }
      if (error.number === 50108) {
        throw new Error(
          "Solo se pueden eliminar expedientes en estado BORRADOR"
        );
      }
      throw error;
    }
  }
}
