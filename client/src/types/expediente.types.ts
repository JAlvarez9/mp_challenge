// =============================================
// ENUMS
// =============================================

export const EstadoExpediente = {
  BORRADOR: "BORRADOR",
  EN_REVISION: "EN_REVISION",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;

export type EstadoExpediente =
  (typeof EstadoExpediente)[keyof typeof EstadoExpediente];

// =============================================
// INTERFACES - EXPEDIENTE
// =============================================

export interface IExpediente {
  id: string;
  numeroExpediente: string;
  fechaRegistro: string;
  descripcion?: string;
  estado: EstadoExpediente;
  usuarioRegistroId: string;
  coordinadorId?: string;
  fechaRevision?: string;
  comentariosRevision?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usuarioRegistroNombre?: string;
  usuarioRegistroCorreo?: string;
  coordinadorNombre?: string;
  coordinadorCorreo?: string;
  totalIndicios?: number;
}

export interface CrearExpedienteDTO {
  numeroExpediente: string;
  descripcion?: string;
}

export interface ActualizarExpedienteDTO {
  descripcion?: string;
}

// =============================================
// INTERFACES - INDICIO
// =============================================

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
  createdAt: string;
  updatedAt: string;
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
}

export interface ActualizarIndicioDTO {
  descripcion?: string;
  color?: string;
  tamano?: string;
  peso?: number;
  ubicacion?: string;
  observaciones?: string;
}

// =============================================
// INTERFACES - REVISION
// =============================================

export interface IHistorialRevision {
  id: string;
  expedienteId: string;
  usuarioRevisorId: string;
  accion: "APROBADO" | "RECHAZADO" | "SOLICITADO_CAMBIOS";
  comentarios?: string;
  fechaRevision: string;
  usuarioRevisorNombre?: string;
  usuarioRevisorCorreo?: string;
}

export interface AprobarExpedienteDTO {
  comentarios?: string;
}

export interface RechazarExpedienteDTO {
  comentarios: string;
}

// =============================================
// RESPONSE TYPES
// =============================================

export interface ExpedienteResponse {
  success: boolean;
  message: string;
  data: {
    expediente: IExpediente;
  };
}

export interface ExpedientesResponse {
  success: boolean;
  message: string;
  data: {
    expedientes: IExpediente[];
  };
}

export interface IndicioResponse {
  success: boolean;
  message: string;
  data: {
    indicio: IIndicio;
  };
}

export interface IndiciosResponse {
  success: boolean;
  message: string;
  data: {
    indicios: IIndicio[];
  };
}

export interface HistorialRevisionResponse {
  success: boolean;
  message: string;
  data: {
    historial: IHistorialRevision[];
  };
}
