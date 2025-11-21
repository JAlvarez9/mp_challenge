import bcrypt from "bcryptjs";
import {
  UsuarioRepository,
  IUsuario,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO,
} from "../repositories/UsuarioRepository";

/**
 * Servicio de Usuario
 * Maneja la lógica de negocio para operaciones de usuarios
 */
export class UsuarioService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  /**
   * Obtiene todos los usuarios activos
   */
  async obtenerTodos(): Promise<IUsuario[]> {
    return await this.usuarioRepository.obtenerTodos();
  }

  /**
   * Obtiene un usuario por ID
   */
  async obtenerPorId(id: string): Promise<IUsuario | null> {
    return await this.usuarioRepository.obtenerPorId(id);
  }

  /**
   * Obtiene un usuario por correo
   */
  async obtenerPorCorreo(correo: string): Promise<IUsuario | null> {
    const usuario = await this.usuarioRepository.obtenerPorCorreo(correo);
    if (!usuario) return null;

    // Remover password del resultado
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Crea un nuevo usuario
   */
  async crear(
    nombre: string,
    correo: string,
    password: string,
    rol: string,
    usuarioActual: string
  ): Promise<IUsuario> {
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const data: CrearUsuarioDTO = {
      nombre,
      correo,
      password: passwordHash,
      rol,
      createdBy: usuarioActual,
    };

    return await this.usuarioRepository.crear(data);
  }

  /**
   * Actualiza un usuario existente
   */
  async actualizar(
    id: string,
    datos: Partial<{ nombre: string; correo: string; rol: string }>,
    usuarioActual: string
  ): Promise<IUsuario | null> {
    const updateData: ActualizarUsuarioDTO = {
      ...datos,
      updatedBy: usuarioActual,
    };

    return await this.usuarioRepository.actualizar(id, updateData);
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async cambiarPassword(
    id: string,
    passwordActual: string,
    passwordNuevo: string,
    usuarioActual: string
  ): Promise<void> {
    // Obtener usuario con password
    const usuario = await this.usuarioRepository.obtenerPorId(id);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Obtener el usuario completo con password
    const usuarioConPassword = await this.usuarioRepository.obtenerPorCorreo(
      usuario.correo
    );

    if (!usuarioConPassword) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar password actual
    const passwordValido = await bcrypt.compare(
      passwordActual,
      usuarioConPassword.password
    );

    if (!passwordValido) {
      throw new Error("Contraseña actual incorrecta");
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNuevo, salt);

    // Actualizar password
    const updateData: ActualizarUsuarioDTO = {
      password: passwordHash,
      updatedBy: usuarioActual,
    };

    await this.usuarioRepository.actualizar(id, updateData);
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  async desactivar(id: string, usuarioActual: string): Promise<void> {
    await this.usuarioRepository.eliminar(id, usuarioActual);
  }

  /**
   * Alias para desactivar (mantener compatibilidad)
   */
  async inactivar(id: string, usuarioActual: string): Promise<void> {
    await this.desactivar(id, usuarioActual);
  }

  /**
   * Activar un usuario
   * Para reactivar un usuario necesitarías un stored procedure específico
   * Por ahora lanzamos error indicando que no está implementado
   */
  async activar(id: string, usuarioActual: string): Promise<void> {
    throw new Error(
      "La funcionalidad de activar usuario requiere un stored procedure adicional (sp_activar_usuario)"
    );
  }
}
