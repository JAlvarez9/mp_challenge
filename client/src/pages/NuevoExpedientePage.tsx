import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { expedienteService } from "../services/expedienteService";
import type { CrearExpedienteDTO } from "../types/expediente.types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

// Validación con Zod
const expedienteSchema = z.object({
  numeroExpediente: z
    .string()
    .min(1, "El número de expediente es requerido")
    .max(50, "Máximo 50 caracteres"),
  descripcion: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
});

type ExpedienteFormData = z.infer<typeof expedienteSchema>;

export default function NuevoExpedientePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
  });

  const onSubmit = async (data: ExpedienteFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const expedienteData: CrearExpedienteDTO = {
        numeroExpediente: data.numeroExpediente.trim(),
        descripcion: data.descripcion?.trim() || undefined,
      };

      const response = await expedienteService.crear(expedienteData);
      const expedienteId = response.data.expediente.id;

      // Redirigir al detalle para agregar indicios
      navigate(`/expedientes/${expedienteId}`, {
        state: { mensaje: "Expediente creado exitosamente. Ahora agrega indicios." },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al crear el expediente. Intenta nuevamente."
      );
      console.error("Error al crear expediente:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Dashboard
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => navigate("/expedientes")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              📄 Mis expedientes
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nuevo Expediente DICRI
          </h1>
          <p className="mt-2 text-gray-600">
            Completa los datos generales del expediente. Después podrás agregar los indicios.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Número de Expediente */}
            <div>
              <label
                htmlFor="numeroExpediente"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de Expediente <span className="text-red-500">*</span>
              </label>
              <Input
                id="numeroExpediente"
                type="text"
                placeholder="Ej: EXP-2025-001"
                {...register("numeroExpediente")}
                className={errors.numeroExpediente ? "border-red-500" : ""}
              />
              {errors.numeroExpediente && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.numeroExpediente.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Debe ser único. Ejemplo: EXP-2025-001, DICRI-001, etc.
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descripción del Caso
              </label>
              <textarea
                id="descripcion"
                rows={4}
                placeholder="Descripción breve del caso o expediente..."
                {...register("descripcion")}
                className={`w-full rounded-md border ${
                  errors.descripcion ? "border-red-500" : "border-gray-300"
                } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.descripcion.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Opcional. Máximo 500 caracteres.</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-xl">ℹ️</span>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">Información</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Una vez creado el expediente, podrás agregar los indicios
                    (evidencias) relacionados al caso. Recuerda que necesitas al
                    menos 1 indicio para enviar el expediente a revisión.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/expedientes")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Expediente"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Ayuda */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">💡 Consejos</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Usa un formato consistente para los números de expediente</li>
            <li>• La descripción te ayudará a identificar rápidamente el caso</li>
            <li>• Podrás editar estos datos mientras el expediente esté en borrador</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
