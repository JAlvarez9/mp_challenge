import { getPool, sql } from "../config/database";

export interface IIndicio {
  id: string;
  expedienteId: string;
  numeroIndicio: string;
  descripcion: string;
  color?: string;
  tamano?: string;
  peso?: number;
  ubicacion?: string;
  observaciones?: string;
  usuarioRegistroId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  usuarioRegistroNombre?: string;
  usuarioRegistroCorreo?: string;
}

export interface CrearIndicioDTO {
  expedienteId: string;
  numeroIndicio: string;
  descripcion: string;
  color?: string;
  tamano?: string;
  peso?: number;
  ubicacion?: string;
  observaciones?: string;
  usuarioRegistroId: string;
  createdBy: string;
}

export interface ActualizarIndicioDTO {
  descripcion?: string;
  color?: string;
  tamano?: string;
  peso?: number;
  ubicacion?: string;
  observaciones?: string;
  updatedBy: string;
}

export class IndicioRepository {
  async crear(data: CrearIndicioDTO): Promise<IIndicio> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("expedienteId", sql.UniqueIdentifier, data.expedienteId)
        .input("numeroIndicio", sql.NVarChar(50), data.numeroIndicio)
        .input("descripcion", sql.NVarChar(500), data.descripcion)
        .input("color", sql.NVarChar(50), data.color || null)
        .input("tamano", sql.NVarChar(100), data.tamano || null)
        .input("peso", sql.Decimal(10, 2), data.peso || null)
        .input("ubicacion", sql.NVarChar(200), data.ubicacion || null)
        .input("observaciones", sql.NVarChar(1000), data.observaciones || null)
        .input(
          "usuarioRegistroId",
          sql.UniqueIdentifier,
          data.usuarioRegistroId
        )
        .input("createdBy", sql.NVarChar(255), data.createdBy)
        .execute("sp_crear_indicio");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50201) throw new Error("Expediente no encontrado");
      if (error.number === 50202)
        throw new Error(
          "Solo se pueden agregar indicios a expedientes en estado BORRADOR"
        );
      if (error.number === 50203)
        throw new Error("El número de indicio ya existe en este expediente");
      throw error;
    }
  }

  async obtenerPorExpediente(expedienteId: string): Promise<IIndicio[]> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("expedienteId", sql.UniqueIdentifier, expedienteId)
      .execute("sp_obtener_indicios_expediente");

    return result.recordset;
  }

  async obtenerPorId(id: string): Promise<IIndicio | null> {
    const pool = await getPool();

    const result = await pool.request().input("id", sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          i.id,
          i.expedienteId,
          i.numeroIndicio,
          i.descripcion,
          i.color,
          i.tamano,
          i.peso,
          i.ubicacion,
          i.observaciones,
          i.usuarioRegistroId,
          i.isActive,
          i.createdAt,
          i.updatedAt,
          i.createdBy,
          i.updatedBy
        FROM Indicios i
        WHERE i.id = @id AND i.isActive = 1
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  async actualizar(id: string, data: ActualizarIndicioDTO): Promise<IIndicio> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("descripcion", sql.NVarChar(500), data.descripcion || null)
        .input("color", sql.NVarChar(50), data.color || null)
        .input("tamano", sql.NVarChar(100), data.tamano || null)
        .input("peso", sql.Decimal(10, 2), data.peso || null)
        .input("ubicacion", sql.NVarChar(200), data.ubicacion || null)
        .input("observaciones", sql.NVarChar(1000), data.observaciones || null)
        .input("updatedBy", sql.NVarChar(255), data.updatedBy)
        .execute("sp_actualizar_indicio");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50204) throw new Error("Indicio no encontrado");
      if (error.number === 50205)
        throw new Error(
          "Solo se pueden editar indicios de expedientes en estado BORRADOR"
        );
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
        .execute("sp_eliminar_indicio");

      return true;
    } catch (error: any) {
      if (error.number === 50206) throw new Error("Indicio no encontrado");
      if (error.number === 50207)
        throw new Error(
          "Solo se pueden eliminar indicios de expedientes en estado BORRADOR"
        );
      throw error;
    }
  }
}
