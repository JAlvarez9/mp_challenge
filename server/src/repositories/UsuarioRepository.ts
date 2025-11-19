import { getPool, sql } from "../config/database";

/**
 * Interface para el usuario (sin password para respuestas)
 */
export interface IUsuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Interface para el usuario con password (solo para auth)
 */
export interface IUsuarioConPassword extends IUsuario {
  password: string;
}

/**
 * DTO para crear usuario
 */
export interface CrearUsuarioDTO {
  nombre: string;
  correo: string;
  password: string;
  rol?: string;
  createdBy: string;
}

/**
 * DTO para actualizar usuario
 */
export interface ActualizarUsuarioDTO {
  nombre?: string;
  correo?: string;
  password?: string;
  rol?: string;
  updatedBy: string;
}

/**
 * Repositorio para operaciones de Usuario usando Stored Procedures
 */
export class UsuarioRepository {
  /**
   * Crea un nuevo usuario
   */
  async crear(data: CrearUsuarioDTO): Promise<IUsuario> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("nombre", sql.NVarChar(100), data.nombre)
        .input("correo", sql.NVarChar(255), data.correo)
        .input("password", sql.NVarChar(255), data.password)
        .input("rol", sql.NVarChar(20), data.rol || "USER")
        .input("createdBy", sql.NVarChar(255), data.createdBy)
        .execute("sp_crear_usuario");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50001) {
        throw new Error("El correo ya está registrado");
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios activos
   */
  async obtenerTodos(): Promise<IUsuario[]> {
    const pool = await getPool();

    const result = await pool.request().execute("sp_obtener_todos_usuarios");

    return result.recordset;
  }

  /**
   * Obtiene un usuario por su ID
   */
  async obtenerPorId(id: string): Promise<IUsuario | null> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .execute("sp_obtener_usuario_por_id");

    return result.recordset[0] || null;
  }

  /**
   * Obtiene un usuario por su correo (incluye password para autenticación)
   */
  async obtenerPorCorreo(correo: string): Promise<IUsuarioConPassword | null> {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("correo", sql.NVarChar(255), correo)
      .execute("sp_obtener_usuario_por_correo");

    return result.recordset[0] || null;
  }

  /**
   * Actualiza un usuario
   */
  async actualizar(id: string, data: ActualizarUsuarioDTO): Promise<IUsuario> {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("nombre", sql.NVarChar(100), data.nombre || null)
        .input("correo", sql.NVarChar(255), data.correo || null)
        .input("password", sql.NVarChar(255), data.password || null)
        .input("rol", sql.NVarChar(20), data.rol || null)
        .input("updatedBy", sql.NVarChar(255), data.updatedBy)
        .execute("sp_actualizar_usuario");

      return result.recordset[0];
    } catch (error: any) {
      if (error.number === 50002) {
        throw new Error("Usuario no encontrado");
      }
      if (error.number === 50003) {
        throw new Error("El correo ya está en uso por otro usuario");
      }
      throw error;
    }
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async eliminar(id: string, updatedBy: string): Promise<boolean> {
    const pool = await getPool();

    try {
      await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("updatedBy", sql.NVarChar(255), updatedBy)
        .execute("sp_eliminar_usuario");

      return true;
    } catch (error: any) {
      if (error.number === 50004) {
        throw new Error("Usuario no encontrado");
      }
      throw error;
    }
  }
}
