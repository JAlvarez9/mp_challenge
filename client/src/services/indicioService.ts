import axios from "../lib/axios";
import type {
  CrearIndicioDTO,
  ActualizarIndicioDTO,
  IndicioResponse,
  IndiciosResponse,
} from "../types/expediente.types";

// =============================================
// INDICIO SERVICE
// =============================================

export const indicioService = {
  /**
   * Crear nuevo indicio
   */
  crear: async (data: CrearIndicioDTO): Promise<IndicioResponse> => {
    const response = await axios.post("/indicios", data);
    return response.data;
  },

  /**
   * Obtener indicios de un expediente
   */
  obtenerPorExpediente: async (
    expedienteId: string
  ): Promise<IndiciosResponse> => {
    const response = await axios.get(`/indicios/expediente/${expedienteId}`);
    return response.data;
  },

  /**
   * Actualizar indicio (solo en expedientes BORRADOR)
   */
  actualizar: async (
    id: string,
    data: ActualizarIndicioDTO
  ): Promise<IndicioResponse> => {
    const response = await axios.put(`/indicios/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar indicio (solo en expedientes BORRADOR)
   */
  eliminar: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/indicios/${id}`);
    return response.data;
  },
};
