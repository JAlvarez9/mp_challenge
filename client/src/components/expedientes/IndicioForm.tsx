import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CrearIndicioDTO, IIndicio, ActualizarIndicioDTO } from "../../types/expediente.types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const indicioSchema = z.object({
  numeroIndicio: z
    .string()
    .min(1, "El número de indicio es requerido")
    .max(50, "Máximo 50 caracteres"),
  descripcion: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "Máximo 500 caracteres"),
  color: z.string().max(50, "Máximo 50 caracteres").optional(),
  tamano: z.string().max(100, "Máximo 100 caracteres").optional(),
  peso: z.string().optional(),
  ubicacion: z.string().max(255, "Máximo 255 caracteres").optional(),
  observaciones: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

type IndicioFormData = z.infer<typeof indicioSchema>;

interface IndicioFormProps {
  expedienteId: string;
  indicio?: IIndicio;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function IndicioForm({
  expedienteId,
  indicio,
  onSubmit,
  onCancel,
  isSubmitting,
}: IndicioFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IndicioFormData>({
    resolver: zodResolver(indicioSchema),
    defaultValues: indicio
      ? {
          numeroIndicio: indicio.numeroIndicio,
          descripcion: indicio.descripcion,
          color: indicio.color || "",
          tamano: indicio.tamano || "",
          peso: indicio.peso?.toString() || "",
          ubicacion: indicio.ubicacion || "",
          observaciones: indicio.observaciones || "",
        }
      : undefined,
  });

  const handleFormSubmit = async (data: IndicioFormData) => {
    // Transformar peso de string a number
    const pesoNumerico = data.peso && data.peso.trim() !== "" 
      ? parseFloat(data.peso) 
      : undefined;

    // Validar peso si existe
    if (pesoNumerico !== undefined && (isNaN(pesoNumerico) || pesoNumerico <= 0)) {
      alert("El peso debe ser un número mayor a 0");
      return;
    }

    if (indicio) {
      // Actualizar
      const updateData: ActualizarIndicioDTO = {
        descripcion: data.descripcion.trim(),
        color: data.color?.trim() || undefined,
        tamano: data.tamano?.trim() || undefined,
        peso: pesoNumerico,
        ubicacion: data.ubicacion?.trim() || undefined,
        observaciones: data.observaciones?.trim() || undefined,
      };
      await onSubmit(updateData);
    } else {
      // Crear
      const createData: CrearIndicioDTO = {
        expedienteId,
        numeroIndicio: data.numeroIndicio.trim(),
        descripcion: data.descripcion.trim(),
        color: data.color?.trim() || undefined,
        tamano: data.tamano?.trim() || undefined,
        peso: pesoNumerico,
        ubicacion: data.ubicacion?.trim() || undefined,
        observaciones: data.observaciones?.trim() || undefined,
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número de Indicio */}
        <div>
          <label htmlFor="numeroIndicio" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Indicio <span className="text-red-500">*</span>
          </label>
          <Input
            id="numeroIndicio"
            type="text"
            placeholder="Ej: IND-001"
            disabled={!!indicio}
            {...register("numeroIndicio")}
            className={`${errors.numeroIndicio ? "border-red-500" : ""} ${
              indicio ? "bg-gray-50" : ""
            }`}
          />
          {errors.numeroIndicio && (
            <p className="mt-1 text-xs text-red-600">{errors.numeroIndicio.message}</p>
          )}
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <Input
            id="color"
            type="text"
            placeholder="Ej: Plateado, Negro, etc."
            {...register("color")}
            className={errors.color ? "border-red-500" : ""}
          />
          {errors.color && (
            <p className="mt-1 text-xs text-red-600">{errors.color.message}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="descripcion"
          rows={3}
          placeholder="Descripción detallada del indicio..."
          {...register("descripcion")}
          className={`w-full rounded-md border ${
            errors.descripcion ? "border-red-500" : "border-gray-300"
          } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.descripcion && (
          <p className="mt-1 text-xs text-red-600">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tamaño */}
        <div>
          <label htmlFor="tamano" className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño
          </label>
          <Input
            id="tamano"
            type="text"
            placeholder="Ej: 20 cm, Mediano, etc."
            {...register("tamano")}
            className={errors.tamano ? "border-red-500" : ""}
          />
          {errors.tamano && (
            <p className="mt-1 text-xs text-red-600">{errors.tamano.message}</p>
          )}
        </div>

        {/* Peso */}
        <div>
          <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <Input
            id="peso"
            type="number"
            step="0.01"
            placeholder="Ej: 0.5"
            {...register("peso")}
            className={errors.peso ? "border-red-500" : ""}
          />
          {errors.peso && (
            <p className="mt-1 text-xs text-red-600">{errors.peso.message}</p>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación
        </label>
        <Input
          id="ubicacion"
          type="text"
          placeholder="Lugar donde se encontró el indicio"
          {...register("ubicacion")}
          className={errors.ubicacion ? "border-red-500" : ""}
        />
        {errors.ubicacion && (
          <p className="mt-1 text-xs text-red-600">{errors.ubicacion.message}</p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          rows={3}
          placeholder="Observaciones adicionales..."
          {...register("observaciones")}
          className={`w-full rounded-md border ${
            errors.observaciones ? "border-red-500" : "border-gray-300"
          } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.observaciones && (
          <p className="mt-1 text-xs text-red-600">{errors.observaciones.message}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : indicio ? "💾 Actualizar" : "➕ Agregar Indicio"}
        </Button>
      </div>
    </form>
  );
}
