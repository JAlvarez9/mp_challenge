import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  UsuarioRepository,
  IUsuario,
  CrearUsuarioDTO,
} from "../repositories/UsuarioRepository";
import { config } from "../config";
import { JWTPayload } from "../types";

/**
 * Servicio de autenticación
 * Maneja registro, login y generación de tokens JWT
 */
export class AuthService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  /**
   * Registra un nuevo usuario en el sistema
   */
  async registrar(
    nombre: string,
    correo: string,
    password: string,
    rol?: string
  ): Promise<{ usuario: IUsuario; token: string }> {
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const data: CrearUsuarioDTO = {
      nombre,
      correo,
      password: passwordHash,
      rol: rol || "USER",
      createdBy: correo,
    };

    const usuarioGuardado = await this.usuarioRepository.crear(data);

    // Generar token JWT
    const token = this.generarToken(usuarioGuardado);

    return { usuario: usuarioGuardado, token };
  }

  /**
   * Autentica un usuario y devuelve un token JWT
   */
  async login(
    correo: string,
    password: string
  ): Promise<{ usuario: IUsuario; token: string }> {
    // Buscar usuario por correo (incluye password)
    const usuario = await this.usuarioRepository.obtenerPorCorreo(correo);

    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar si el usuario está activo
    if (!usuario.isActive) {
      throw new Error("Usuario inactivo");
    }

    // Verificar la contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      throw new Error("Credenciales inválidas");
    }

    // Generar token JWT
    const token = this.generarToken(usuario);

    // Remover password de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;

    return { usuario: usuarioSinPassword, token };
  }

  /**
   * Genera un token JWT para el usuario
   */
  private generarToken(usuario: IUsuario): string {
    const payload: JWTPayload = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Verifica si un token es válido
   */
  async verificarToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(
        token,
        config.jwt.secret
      ) as unknown as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }
}
