import axios from "../lib/axios";
import type {
  AprobarExpedienteDTO,
  RechazarExpedienteDTO,
  ExpedienteResponse,
  HistorialRevisionResponse,
} from "../types/expediente.types";

// =============================================
// REVISION SERVICE (ADMIN/MODERADOR)
// =============================================

export const revisionService = {
  /**
   * Aprobar expediente en revisión
   * Solo ADMIN y MODERADOR
   */
  aprobar: async (
    expedienteId: string,
    data: AprobarExpedienteDTO
  ): Promise<ExpedienteResponse> => {
    const response = await axios.post(
      `/revisiones/${expedienteId}/aprobar`,
      data
    );
    return response.data;
  },

  /**
   * Rechazar expediente en revisión
   * Solo ADMIN y MODERADOR
   * Comentarios son obligatorios
   */
  rechazar: async (
    expedienteId: string,
    data: RechazarExpedienteDTO
  ): Promise<ExpedienteResponse> => {
    const response = await axios.post(
      `/revisiones/${expedienteId}/rechazar`,
      data
    );
    return response.data;
  },

  /**
   * Obtener historial de revisiones de un expediente
   */
  obtenerHistorial: async (
    expedienteId: string
  ): Promise<HistorialRevisionResponse> => {
    const response = await axios.get(`/revisiones/${expedienteId}/historial`);
    return response.data;
  },
};
