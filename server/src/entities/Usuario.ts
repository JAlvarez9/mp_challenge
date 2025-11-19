import { Entity, Column, Index } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { RolUsuario } from "../types/enums";

/**
 * Entidad Usuario
 * Representa a los usuarios del sistema con autenticación
 */
@Entity("usuarios")
export class Usuario extends BaseEntity {
  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
    comment: "Nombre completo del usuario",
  })
  nombre: string;

  @Index("IDX_USUARIO_CORREO", { unique: true })
  @Column({
    type: "varchar",
    length: 150,
    nullable: false,
    unique: true,
    comment: "Correo electrónico del usuario",
  })
  correo: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
    select: false,
    comment: "Contraseña encriptada del usuario",
  })
  password: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: false,
    default: RolUsuario.USER,
    comment: "Rol del usuario en el sistema",
  })
  rol: RolUsuario;
}
