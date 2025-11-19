import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";

/**
 * Entidad base auditable que todas las entidades deben extender
 * Proporciona campos automáticos para auditoría de cambios
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({
    type: "datetime2",
    name: "created_at",
    comment: "Fecha de creación del registro",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "datetime2",
    name: "updated_at",
    comment: "Fecha de última actualización del registro",
  })
  updatedAt: Date;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    name: "created_by",
    comment: "Usuario que creó el registro",
  })
  createdBy: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    name: "updated_by",
    comment: "Usuario que actualizó el registro por última vez",
  })
  updatedBy: string;

  @Column({
    type: "bit",
    default: true,
    name: "is_active",
    comment: "Indica si el registro está activo",
  })
  isActive: boolean;
}
