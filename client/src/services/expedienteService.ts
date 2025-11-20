import axios from "../lib/axios";
import type {
  CrearExpedienteDTO,
  ActualizarExpedienteDTO,
  ExpedienteResponse,
  ExpedientesResponse,
} from "../types/expediente.types";

// =============================================
// EXPEDIENTE SERVICE
// =============================================

export const expedienteService = {
  /**
   * Crear nuevo expediente
   */
  crear: async (data: CrearExpedienteDTO): Promise<ExpedienteResponse> => {
    const response = await axios.post("/expedientes", data);
    return response.data;
  },

  /**
   * Obtener todos los expedientes del usuario
   * (USER ve solo los suyos, ADMIN ve todos)
   */
  obtenerTodos: async (): Promise<ExpedientesResponse> => {
    const response = await axios.get("/expedientes");
    return response.data;
  },

  /**
   * Obtener expediente por ID
   */
  obtenerPorId: async (id: string): Promise<ExpedienteResponse> => {
    const response = await axios.get(`/expedientes/${id}`);
    return response.data;
  },

  /**
   * Actualizar expediente (solo en BORRADOR)
   */
  actualizar: async (
    id: string,
    data: ActualizarExpedienteDTO
  ): Promise<ExpedienteResponse> => {
    const response = await axios.put(`/expedientes/${id}`, data);
    return response.data;
  },

  /**
   * Enviar expediente a revisión
   * Requiere al menos 1 indicio
   */
  enviarARevision: async (id: string): Promise<ExpedienteResponse> => {
    const response = await axios.post(`/expedientes/${id}/revision`);
    return response.data;
  },

  /**
   * Eliminar expediente (solo BORRADOR)
   */
  eliminar: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/expedientes/${id}`);
    return response.data;
  },
};
