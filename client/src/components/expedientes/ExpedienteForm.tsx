import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IExpediente, ActualizarExpedienteDTO } from "../../types/expediente.types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const expedienteSchema = z.object({
  descripcion: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
});

type ExpedienteFormData = z.infer<typeof expedienteSchema>;

interface ExpedienteFormProps {
  expediente: IExpediente;
  onSubmit: (data: ActualizarExpedienteDTO) => Promise<void>;
  isSubmitting: boolean;
  puedeEditar: boolean;
}

export function ExpedienteForm({
  expediente,
  onSubmit,
  isSubmitting,
  puedeEditar,
}: ExpedienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: {
      descripcion: expediente.descripcion || "",
    },
  });

  const handleFormSubmit = async (data: ExpedienteFormData) => {
    const updateData: ActualizarExpedienteDTO = {
      descripcion: data.descripcion?.trim() || undefined,
    };
    await onSubmit(updateData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Número de Expediente (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Expediente
        </label>
        <Input
          type="text"
          value={expediente.numeroExpediente}
          disabled
          className="bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          El número de expediente no se puede modificar
        </p>
      </div>

      {/* Fecha de Registro (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Registro
        </label>
        <Input
          type="text"
          value={new Date(expediente.fechaRegistro).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          disabled
          className="bg-gray-50"
        />
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
          disabled={!puedeEditar}
          {...register("descripcion")}
          className={`w-full rounded-md border ${
            errors.descripcion ? "border-red-500" : "border-gray-300"
          } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !puedeEditar ? "bg-gray-50 cursor-not-allowed" : ""
          }`}
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Opcional. Máximo 500 caracteres.</p>
      </div>

      {/* Botón Guardar (solo si puede editar y hay cambios) */}
      {puedeEditar && isDirty && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "💾 Guardar Cambios"}
          </Button>
        </div>
      )}
    </form>
  );
}
